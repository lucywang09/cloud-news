# AWS Cloud News Dashboard

A minimal, professional static site that aggregates AWS Cloud news from official RSS feeds.

![AWS Cloud News](https://img.shields.io/badge/AWS-Cloud%20News-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)

## ✨ Features

- **Real-time News**: Aggregates from 4 official AWS RSS feeds
- **Professional Design**: Dark theme with AWS branding colors
- **Smooth Animations**: Modern UI with hover effects and transitions
- **Responsive**: Looks great on mobile, tablet, and desktop
- **Fast Loading**: Static site with minimal dependencies
- **Auto-Updates**: Scheduled daily updates via GitHub Actions

## 🎨 Design

- **Dark Mode**: Premium feel with deep dark backgrounds
- **AWS Colors**: Orange (#ff9900) and Blue (#147EFB) accents
- **Modern Typography**: Clean, readable fonts
- **Smooth Interactions**: Hover effects and animations
- **Custom Scrollbar**: Dark-themed scrollbar

## 📰 News Sources

1. **AWS What's New** - Latest product launches and updates
2. **AWS News Blog** - Official AWS news and announcements
3. **AWS Architecture Blog** - Architecture patterns and best practices
4. **AWS Security Blog** - Security updates and guidelines

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cloud-news.git
cd cloud-news

# Install dependencies
npm install

# Fetch latest news
npm run update-news
```

### Local Development

Open `index.html` in your browser or use a local server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js http-server
npx http-server
```

Visit `http://localhost:8000`

## 📦 Deployment

### GitHub Pages (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cloud-news.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Navigate to Pages section
   - Source: **GitHub Actions**

3. **Automatic Updates:**
   - The workflow runs daily at 8:00 AM UTC
   - Updates `news.json` and redeploys automatically
   - You can also trigger manually from Actions tab

4. **Access Your Site:**
   - `https://YOUR_USERNAME.github.io/cloud-news/`

## 📁 Project Structure

```
cloud-news/
├── index.html          # Main HTML file
├── style.css           # Styles with dark theme
├── script.js           # JavaScript for filtering and rendering
├── news.json          # Generated news data
├── package.json       # Dependencies
├── scripts/
│   └── fetch-news.js  # RSS fetcher script
└── .github/
    └── workflows/
        └── deploy.yml # GitHub Actions workflow
```

## 🔄 Updating News

### Manual Update

```bash
npm run update-news
```

### Automatic Updates

The GitHub Actions workflow automatically:
- Runs daily at 8:00 AM UTC
- Fetches latest news from all RSS feeds
- Updates `news.json`
- Redeploys the site

## 🎯 Features in Detail

### Filter Tabs
- **All News**: Shows all 30 items
- **What's New**: AWS product launches
- **News Blog**: General AWS news
- **Architecture**: Architecture content
- **Security**: Security updates

### News Cards
- Color-coded source badges
- Relative timestamps (2h ago, 3d ago)
- Hover effects with lift and shadow
- External link icon on hover
- Click anywhere to open article

### Responsive Design
- **Desktop**: 3-column grid
- **Tablet**: 2-column grid
- **Mobile**: Single column

## 🛠️ Customization

### Change Colors

Edit `style.css`:

```css
:root {
    --bg-dark: #0f1419;
    --card-bg: #1a1f2e;
    --aws-orange: #ff9900;
    --aws-blue: #147EFB;
}
```

### Change Number of Items

Edit `scripts/fetch-news.js`:

```javascript
const topItems = uniqueItems.slice(0, 30); // Change 30 to your desired number
```

### Add More Feeds

Edit `scripts/fetch-news.js`:

```javascript
const FEEDS = {
    "AWS What's New": "https://...",
    "Your New Feed": "https://...",
};
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit pull requests.

## ⭐ Show Your Support

Give a ⭐️ if you like this project!
