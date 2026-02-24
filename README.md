# AWS Cloud News Dashboard

A modern, professional static site that aggregates AWS cloud news from official RSS feeds. Built with vanilla HTML, CSS, and JavaScript for GitHub Pages.

## Features

- **Real-time AWS News**: Aggregates from 4 official AWS RSS feeds
- **Modern Dark Theme**: Professional UI with AWS branding colors
- **Smart Filtering**: Filter by news source with item counts
- **Responsive Design**: Works beautifully on mobile, tablet, and desktop
- **Smooth Animations**: Professional transitions and hover effects
- **Auto-updates**: GitHub Actions refreshes news every 6 hours

## RSS Sources

1. **What's New** - Latest AWS service announcements
2. **News Blog** - AWS company news and updates
3. **Architecture Blog** - Best practices and architectural patterns
4. **Security Blog** - Security updates and best practices

## Setup

```bash
# Install dependencies
npm install

# Fetch initial news data
npm run update-news
```

## Local Development

Simply open `index.html` in your browser after running `npm run update-news`.

For a local server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then visit `http://localhost:8000`

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Under "Build and deployment", select "GitHub Actions"
4. Push to the `main` branch to trigger deployment

The site will automatically update every 6 hours with fresh news.

## File Structure

```
.
├── index.html          # Main HTML file
├── style.css           # All styling and animations
├── news.json           # Generated news data
├── package.json        # Dependencies and scripts
├── scripts/
│   └── fetch-news.js   # RSS feed aggregator
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions deployment
```

## Customization

- **Colors**: Edit CSS variables in `style.css` under `:root`
- **Number of items**: Change the slice limit in `scripts/fetch-news.js`
- **Update frequency**: Modify the cron schedule in `.github/workflows/deploy.yml`
- **RSS feeds**: Add/remove feeds in `scripts/fetch-news.js`

## Technologies

- Pure HTML/CSS/JavaScript (no frameworks)
- RSS Parser for Node.js
- GitHub Actions for CI/CD
- GitHub Pages for hosting

## License

MIT
