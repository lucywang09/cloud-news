const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');

const parser = new Parser();

// RSS Feed URLs
const FEEDS = {
    "AWS What's New": "https://aws.amazon.com/about-aws/whats-new/recent/feed/",
    "AWS News Blog": "https://aws.amazon.com/blogs/aws/feed/",
    "AWS Architecture Blog": "https://aws.amazon.com/blogs/architecture/feed/",
    "AWS Security Blog": "https://aws.amazon.com/blogs/security/feed/"
};

async function fetchFeed(name, url) {
    try {
        console.log(`Fetching ${name}...`);
        const feed = await parser.parseURL(url);
        
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            source: name,
            pubDate: item.pubDate || item.isoDate
        }));
    } catch (error) {
        console.error(`Error fetching ${name}:`, error.message);
        return [];
    }
}

async function fetchAllFeeds() {
    console.log('Starting to fetch all RSS feeds...\n');
    
    const promises = Object.entries(FEEDS).map(([name, url]) => 
        fetchFeed(name, url)
    );
    
    const results = await Promise.all(promises);
    const allItems = results.flat();
    
    // Remove duplicates by URL
    const uniqueItems = [];
    const seenUrls = new Set();
    
    for (const item of allItems) {
        if (!seenUrls.has(item.link)) {
            seenUrls.add(item.link);
            uniqueItems.push(item);
        }
    }
    
    // Sort by date (newest first)
    uniqueItems.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA;
    });
    
    // Keep top 30 items
    const topItems = uniqueItems.slice(0, 30);
    
    console.log(`\nTotal items fetched: ${allItems.length}`);
    console.log(`Unique items: ${uniqueItems.length}`);
    console.log(`Keeping top: ${topItems.length}`);
    
    return topItems;
}

async function generateNewsJson() {
    try {
        const items = await fetchAllFeeds();
        
        const data = {
            lastUpdated: new Date().toISOString(),
            items: items
        };
        
        // Write to news.json in repo root
        const outputPath = path.join(__dirname, '..', 'news.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        
        console.log(`\n✅ Successfully generated news.json with ${items.length} items`);
        console.log(`📍 Location: ${outputPath}`);
        console.log(`🕐 Last updated: ${data.lastUpdated}`);
        
        // Log source breakdown
        const sourceCount = {};
        items.forEach(item => {
            sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
        });
        
        console.log('\n📊 Source Breakdown:');
        Object.entries(sourceCount).forEach(([source, count]) => {
            console.log(`   ${source}: ${count}`);
        });
        
    } catch (error) {
        console.error('Error generating news.json:', error);
        process.exit(1);
    }
}

// Run
generateNewsJson();
