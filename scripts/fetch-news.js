const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

const parser = new Parser();

const RSS_FEEDS = [
  {
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    source: "What's New"
  },
  {
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    source: 'News Blog'
  },
  {
    url: 'https://aws.amazon.com/blogs/architecture/feed/',
    source: 'Architecture Blog'
  },
  {
    url: 'https://aws.amazon.com/blogs/security/feed/',
    source: 'Security Blog'
  }
];

async function fetchFeed(feedConfig) {
  try {
    console.log(`Fetching ${feedConfig.source}...`);
    const feed = await parser.parseURL(feedConfig.url);
    
    return feed.items.map(item => ({
      title: item.title,
      link: item.link,
      source: feedConfig.source,
      pubDate: item.pubDate || item.isoDate
    }));
  } catch (error) {
    console.error(`Error fetching ${feedConfig.source}:`, error.message);
    return [];
  }
}

async function main() {
  console.log('Starting RSS feed aggregation...');
  
  // Fetch all feeds in parallel
  const results = await Promise.all(
    RSS_FEEDS.map(feed => fetchFeed(feed))
  );
  
  // Flatten and combine all items
  const allItems = results.flat();
  
  // Deduplicate by URL
  const uniqueItems = Array.from(
    new Map(allItems.map(item => [item.link, item])).values()
  );
  
  // Sort by date (newest first)
  uniqueItems.sort((a, b) => {
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    return dateB - dateA;
  });
  
  // Keep top 30 items
  const topItems = uniqueItems.slice(0, 30);
  
  // Prepare output
  const output = {
    lastUpdated: new Date().toISOString(),
    items: topItems
  };
  
  // Write to news.json
  const outputPath = path.join(__dirname, '..', 'news.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`✓ Successfully wrote ${topItems.length} items to news.json`);
  console.log(`Last updated: ${output.lastUpdated}`);
  
  // Log count by source
  const counts = topItems.reduce((acc, item) => {
    acc[item.source] = (acc[item.source] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\nItems by source:');
  Object.entries(counts).forEach(([source, count]) => {
    console.log(`  ${source}: ${count}`);
  });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
