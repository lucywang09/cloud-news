const fs = require('fs');
const path = require('path');

const newsFile = path.join(__dirname, 'news.json');

// Simulate fetching cloud news updates
const getLatestNews = () => {
  const timestamp = new Date().toISOString();
  return [
    {
      id: 1,
      title: "AWS announces new EC2 instance types",
      source: "AWS Blog",
      timestamp: timestamp,
      category: "Cloud Computing"
    },
    {
      id: 2,
      title: "Azure AI Services updates",
      source: "Microsoft Azure",
      timestamp: timestamp,
      category: "AI/ML"
    },
    {
      id: 3,
      title: "Google Cloud Platform pricing updates",
      source: "GCP Blog",
      timestamp: timestamp,
      category: "Cloud Computing"
    }
  ];
};

// Update news.json
const news = getLatestNews();
fs.writeFileSync(newsFile, JSON.stringify(news, null, 2));
console.log(`✓ Updated news.json with ${news.length} items at ${new Date().toISOString()}`);
