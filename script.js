// State
let allNews = [];
let currentFilter = 'all';

// Source mapping
const sourceMap = {
    "AWS What's New": 'whats-new',
    "AWS News Blog": 'news-blog',
    "AWS Architecture Blog": 'architecture',
    "AWS Security Blog": 'security'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    setupFilterTabs();
});

// Load news from JSON
async function loadNews() {
    try {
        const response = await fetch('./news.json');
        const data = await response.json();
        
        allNews = data.items || [];
        
        // Update last updated timestamp
        const lastUpdated = new Date(data.lastUpdated);
        document.getElementById('lastUpdated').textContent = formatDate(lastUpdated);
        
        // Hide loading, show content
        document.getElementById('loading').style.display = 'none';
        
        // Update counts
        updateCounts();
        
        // Render news
        renderNews();
        
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('emptyState').querySelector('p').textContent = 
            'Failed to load news. Please try again later.';
    }
}

// Setup filter tabs
function setupFilterTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update filter
            currentFilter = tab.dataset.filter;
            
            // Render filtered news
            renderNews();
        });
    });
}

// Update counts
function updateCounts() {
    const counts = {
        all: allNews.length,
        'whats-new': 0,
        'news-blog': 0,
        'architecture': 0,
        'security': 0
    };
    
    allNews.forEach(item => {
        const sourceKey = sourceMap[item.source];
        if (sourceKey && counts[sourceKey] !== undefined) {
            counts[sourceKey]++;
        }
    });
    
    Object.keys(counts).forEach(key => {
        const countEl = document.getElementById(`count-${key}`);
        if (countEl) {
            countEl.textContent = counts[key];
        }
    });
}

// Render news
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    const emptyState = document.getElementById('emptyState');
    
    // Filter news
    const filteredNews = currentFilter === 'all' 
        ? allNews 
        : allNews.filter(item => sourceMap[item.source] === currentFilter);
    
    // Show/hide empty state
    if (filteredNews.length === 0) {
        newsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    newsGrid.style.display = 'grid';
    
    // Render cards
    newsGrid.innerHTML = filteredNews.map((item, index) => {
        const sourceClass = sourceMap[item.source] || 'news-blog';
        const relativeDate = getRelativeTime(new Date(item.pubDate));
        
        return `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-card" style="animation-delay: ${index * 0.05}s">
                <div class="card-header">
                    <span class="source-badge ${sourceClass}">${item.source.replace('AWS ', '')}</span>
                    <svg class="external-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15 3h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2 class="card-title">${escapeHtml(item.title)}</h2>
                <p class="card-date">${relativeDate}</p>
            </a>
        `;
    }).join('');
}

// Get relative time
function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
