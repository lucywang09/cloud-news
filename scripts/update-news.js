const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const FEEDS = [
    { url: 'https://aws.amazon.com/blogs/aws/feed/', source: 'AWS' },
    { url: 'https://azure.microsoft.com/en-us/blog/feed/', source: 'Azure' },
    { url: 'https://kubernetes.io/feed.xml', source: 'Kubernetes' }
];

const MAX_ITEMS = 30;

async function fetchFeed(feed) {
    const parser = new Parser();
    try {
        console.log(`Fetching ${feed.source}...`);
        const result = await parser.parseURL(feed.url);
        return result.items.map(item => ({
            title: item.title,
            url: item.link,
            source: feed.source,
            date: item.pubDate || item.isoDate
        }));
    } catch (error) {
        console.error(`Error fetching ${feed.source}:`, error.message);
        return [];
    }
}

async function updateNews() {
    console.log('Fetching RSS feeds...');
    
    const allItems = [];
    for (const feed of FEEDS) {
        const items = await fetchFeed(feed);
        allItems.push(...items);
    }

    // Dedupe by URL
    const seenUrls = new Set();
    const uniqueItems = allItems.filter(item => {
        if (seenUrls.has(item.url)) {
            return false;
        }
        seenUrls.add(item.url);
        return true;
    });

    // Sort by date (newest first)
    uniqueItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Keep only MAX_ITEMS
    const finalItems = uniqueItems.slice(0, MAX_ITEMS);

    const output = {
        lastUpdated: new Date().toISOString(),
        items: finalItems
    };

    const outputPath = path.join(__dirname, '..', 'news.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`✓ Updated news.json with ${finalItems.length} items`);
}

updateNews().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
