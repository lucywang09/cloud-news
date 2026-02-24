# Security Audit Report — cloud-news

**Date:** 2026-02-24
**Scope:** Full repository audit with focus on RSS / news-fetching attack surface
**Auditor:** Warp Agent

---

## Executive Summary

This audit was requested against `fetch-news.js` for RSS-related vulnerabilities. **`fetch-news.js` does not currently exist in the repository** (checked `main` and `feature/breaking-news-ticker` branches). The project currently consists of a static `index.html` page, with a `feature/breaking-news-ticker` branch that adds a news ticker powered by a local `news.json` file.

Despite the absence of a dedicated RSS fetcher, several security findings apply to the current codebase, and additional high-risk vulnerabilities would be introduced if an RSS/Atom feed fetcher is added in the future (as implied by the project description: *"Building a cloud news website that updates daily"*).

Findings are rated: **Critical · High · Medium · Low · Informational**

---

## Current Codebase Findings

### 1. No Content Security Policy (CSP) — Medium

**File:** `index.html` (both branches)

The page does not set a `Content-Security-Policy` header or `<meta>` tag. On the `feature/breaking-news-ticker` branch, an inline `<script>` block executes without nonce or hash protection. If `news.json` is ever served from or influenced by an untrusted source, the lack of CSP increases the blast radius of any injection.

**Recommendation:**
- Add a strict CSP via `<meta>` tag or HTTP header, e.g.:
  ```
  default-src 'self'; script-src 'self' 'sha256-<hash>'; style-src 'self' 'unsafe-inline';
  ```
- Move inline scripts to external `.js` files to eliminate the need for `'unsafe-inline'` script sources.

### 2. No Input Validation on `news.json` — Medium

**File:** `index.html` on `feature/breaking-news-ticker` branch

The client-side code trusts the structure of `news.json` without validation:
```js
const news = await res.json();
news.sort((a, b) => new Date(b.date) - new Date(a.date));
const latest = news[0];
document.getElementById('ticker-text').textContent = latest.headline;
```

If `news.json` is malformed, missing fields, or contains unexpected types, the code will throw at runtime. More critically, if `news.json` were ever sourced from an external feed, injected properties could lead to prototype pollution (via crafted `__proto__` keys in JSON) or denial of service (excessively large arrays).

**Mitigating factor:** The use of `.textContent` (not `.innerHTML`) prevents XSS from headline values. This is a positive security practice already in place.

**Recommendation:**
- Validate the response schema (array of objects with `headline: string` and `date: string`).
- Add a bounds check: reject payloads exceeding a reasonable item count or total byte size.

### 3. No Fetch Response Validation — Low

**File:** `index.html` on `feature/breaking-news-ticker` branch

`fetch('news.json')` does not verify the HTTP status code before parsing:
```js
const res = await fetch('news.json');
const news = await res.json();
```

**Recommendation:**
- Check `res.ok` before parsing to handle error responses gracefully.

---

## RSS Feed Integration — Anticipated Vulnerabilities

If a `fetch-news.js` script is introduced to pull headlines from external RSS/Atom feeds, the following vulnerabilities **must** be addressed:

### 4. XML External Entity (XXE) Injection — Critical

RSS and Atom feeds are XML documents. If parsed with a default XML parser that resolves external entities, an attacker-controlled feed can:
- Read arbitrary files from the server (`file:///etc/passwd`)
- Perform Server-Side Request Forgery (SSRF) via entity URLs
- Cause denial of service via recursive entity expansion ("Billion Laughs" attack)

**Recommendation:**
- Use a parser that disables DTD processing and external entity resolution by default. In Node.js, avoid native `DOMParser` or `libxmljs` defaults. Prefer libraries like `fast-xml-parser` with strict options:
  ```js
  const parser = new XMLParser({
    allowBooleanAttributes: false,
    processEntities: false,
  });
  ```
- If using `xml2js`, set `{explicitCharkey: true, xmlns: false}` and disable DTD processing.
- **Never** pass untrusted XML through `eval()`, `new Function()`, or template literals.

### 5. Server-Side Request Forgery (SSRF) — Critical

If `fetch-news.js` accepts feed URLs from user input, configuration files, or a database, an attacker could supply internal network URLs (`http://169.254.169.254/latest/meta-data/`, `http://localhost:6379/`, etc.) to probe or exfiltrate data from internal services.

**Recommendation:**
- Maintain an allowlist of permitted feed domains.
- Validate and resolve URLs before fetching; reject private/internal IP ranges (RFC 1918, link-local, loopback).
- Use a library like `ssrf-req-filter` or implement DNS rebinding protection.
- Set strict timeouts and redirect limits on HTTP requests.

### 6. Stored Cross-Site Scripting (XSS) via Feed Content — High

RSS feed titles, descriptions, and content fields frequently contain HTML. If these values are written to `news.json` without sanitization and later rendered via `.innerHTML` or a templating engine, stored XSS is possible.

**Mitigating factor:** The current `feature/breaking-news-ticker` branch uses `.textContent`, which is safe. However, future UI changes (e.g., rendering HTML descriptions) could introduce this vulnerability.

**Recommendation:**
- Sanitize all feed-sourced strings server-side before writing to `news.json`. Strip all HTML tags or use an allowlist sanitizer (e.g., `DOMPurify` or `sanitize-html`).
- Continue using `.textContent` for plain-text fields; use a sanitizer if `.innerHTML` is ever needed.

### 7. Denial of Service via Malicious Feeds — High

An attacker-controlled RSS feed could return:
- Extremely large XML documents (gigabytes) to exhaust memory
- Deeply nested XML structures to exhaust stack/CPU
- Infinite or very slow HTTP responses ("slow loris")
- Compressed payloads that expand massively ("zip bomb" via gzip encoding)

**Recommendation:**
- Set a maximum response body size (e.g., 1 MB) and abort on exceeding it.
- Set connection and read timeouts (e.g., 10 seconds).
- Limit XML parsing depth.
- Disable or limit decompression ratios.

### 8. Feed URL Injection / Open Redirect — Medium

If feed URLs are constructed using string concatenation with user-supplied parameters:
```js
const feedUrl = `https://example.com/rss?category=${userInput}`;
```
An attacker could inject a completely different URL via newline or protocol manipulation.

**Recommendation:**
- Use the `URL` constructor to build and validate URLs.
- Enforce `https:` protocol only.
- Never interpolate user input directly into URL strings.

### 9. Dependency Supply Chain Risks — Medium

Adding an RSS parser introduces npm dependencies that could be compromised.

**Recommendation:**
- Pin exact dependency versions in `package.json`.
- Use `npm audit` / `npm audit signatures` regularly.
- Consider using `package-lock.json` and enable npm provenance checks.
- Minimize the number of transitive dependencies; prefer well-maintained libraries.

### 10. Lack of HTTPS Enforcement for Feed Sources — Medium

Fetching RSS feeds over plain HTTP exposes the content to man-in-the-middle modification. An attacker on the network path could inject malicious headlines or XML payloads.

**Recommendation:**
- Only fetch feeds over HTTPS.
- Reject HTTP URLs and do not follow HTTP redirects from HTTPS origins.

---

## Summary Table

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | No Content Security Policy | Medium | Current |
| 2 | No input validation on news.json | Medium | Current (feature branch) |
| 3 | No fetch response validation | Low | Current (feature branch) |
| 4 | XXE Injection (RSS/XML parsing) | Critical | Future risk |
| 5 | SSRF via feed URLs | Critical | Future risk |
| 6 | Stored XSS via feed content | High | Future risk |
| 7 | DoS via malicious feeds | High | Future risk |
| 8 | Feed URL injection | Medium | Future risk |
| 9 | Dependency supply chain risks | Medium | Future risk |
| 10 | No HTTPS enforcement for feeds | Medium | Future risk |

---

## Positive Findings

- **`.textContent` used instead of `.innerHTML`** — prevents reflected/stored XSS from headline data (feature branch).
- **Static local data** — `news.json` is currently a static file, limiting the attack surface.
- **No server-side code yet** — the absence of `fetch-news.js` means none of the critical RSS parsing vulnerabilities are currently exploitable.

---

## Recommended Immediate Actions

1. **Add a Content Security Policy** to `index.html`.
2. **Add response and schema validation** to the client-side fetch logic (feature branch).
3. **When implementing `fetch-news.js`:**
   - Use a safe XML parser with XXE protections disabled by default.
   - Implement SSRF protections (URL allowlisting, private IP blocking).
   - Sanitize all feed-sourced content before writing to `news.json`.
   - Set strict size limits, timeouts, and parsing depth limits.
   - Enforce HTTPS-only feed sources.
   - Pin and audit all npm dependencies.

---

## Reporting Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly by opening a private security advisory via GitHub or emailing the repository owner directly. Do not open public issues for security vulnerabilities.
