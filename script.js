// Fetch stock price, latest news, and manage user portfolio

let currentTicker = 'CSCO';
let holdings = JSON.parse(localStorage.getItem('csco_portfolio_holdings')) || {
    'CSCO': 100,
    'GOOG': 10,
    'LMT': 5,
    'VZ': 50,
    'T': 100,
    'NVDA': 20,
    'PANW': 10,
    'F': 150,
    'HPQ': 80,
    'TM': 30,
    'TSM': 25
};
let priceCache = {}; // Cache to store price data: { TICKER: floatPrice }

async function fetchQuotes(tickers) {
    const uniqueTickers = [...new Set(tickers)].filter(Boolean);
    if (uniqueTickers.length === 0) return [];
    
    const promises = uniqueTickers.map(async (ticker) => {
        const cnbcUrl = `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${ticker.toUpperCase()}&requestMethod=itv&noform=1&fund=1&exthrs=1&output=json&events=1`;
        try {
            const res = await fetch(cnbcUrl);
            const data = await res.json();
            return data?.FormattedQuoteResult?.FormattedQuote?.[0] || null;
        } catch (e) {
            console.error(`Failed to fetch quote for ${ticker}:`, e);
            return null;
        }
    });
    
    const results = await Promise.all(promises);
    return results.filter(Boolean);
}

async function fetchNews(ticker) {
    const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${ticker.toUpperCase()}&region=US&lang=en-US`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    try {
        const res = await fetch(proxyUrl);
        const data = await res.json();
        
        if (!data || !data.items) return [];
        
        return data.items.slice(0, 5).map(item => ({
            title: item.title || 'No Title',
            url: item.link || '#',
            description: item.description || item.content || ''
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

function summarizeDescription(description) {
    if (!description) return "No description available to analyze.";
    
    // Strip HTML tags if any (RSS description sometimes has them)
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = description;
    let text = tempDiv.textContent || tempDiv.innerText || "";
    
    // Clean up spaces
    text = text.replace(/\s+/g, " ").trim();
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    
    if (sentences.length <= 1) {
        return text ? `• ${text}` : "Summary not available.";
    }
    
    // Format the first 2 main sentences as nice bullet points
    return sentences.slice(0, 2).map(s => `• ${s}.`).join("<br>");
}

function renderAISummary(container, description, index) {
    // Initial loading state
    container.className = 'ai-summary';
    container.innerHTML = `
        <div class="ai-summary-title">✨ AI Insights</div>
        <div class="ai-summary-loading">
            <div class="spinner"></div>
            <span>AI is analyzing article...</span>
        </div>
    `;
    
    // Cascade the rendering slightly to look like real-time agent generation
    setTimeout(() => {
        const summary = summarizeDescription(description);
        container.innerHTML = `
            <div class="ai-summary-title">✨ AI Insights</div>
            <p class="ai-summary-text">${summary}</p>
        `;
    }, 600 + index * 400);
}

function saveHoldings() {
    localStorage.setItem('csco_portfolio_holdings', JSON.stringify(holdings));
}

function renderPortfolio() {
    const portfolioList = document.getElementById('portfolio-list');
    const totalValEl = document.getElementById('total-portfolio-value');
    
    if (!portfolioList || !totalValEl) return;
    
    portfolioList.innerHTML = '';
    let totalValue = 0;
    
    // Get unique list of held tickers
    const heldTickers = Object.keys(holdings).filter(t => holdings[t] > 0);
    
    if (heldTickers.length === 0) {
        portfolioList.innerHTML = '<div class="portfolio-empty">No shares owned</div>';
        totalValEl.textContent = '$0.00';
        return;
    }
    
    heldTickers.forEach(ticker => {
        const shares = holdings[ticker];
        const lastPrice = priceCache[ticker.toUpperCase()] || 0;
        const val = shares * lastPrice;
        totalValue += val;
        
        const item = document.createElement('div');
        // Add active-holding class if this item is currently selected in the dashboard
        const isActive = ticker.toUpperCase() === currentTicker.toUpperCase();
        item.className = `portfolio-item ${isActive ? 'active-holding' : ''}`;
        
        item.innerHTML = `
            <div class="portfolio-item-left">
                <span class="portfolio-ticker">${ticker.toUpperCase()}</span>
                <span class="portfolio-shares">${shares.toLocaleString(undefined, {maximumFractionDigits: 4})} shares</span>
            </div>
            <div class="portfolio-item-right">
                <span class="portfolio-item-price">$${lastPrice ? lastPrice.toFixed(2) : '--'}</span>
                <span class="portfolio-item-val">$${val ? val.toFixed(2) : '--'}</span>
            </div>
        `;
        
        // Clicking a portfolio item loads it on the dashboard
        item.addEventListener('click', () => {
            if (ticker.toUpperCase() !== currentTicker.toUpperCase()) {
                currentTicker = ticker.toUpperCase();
                updateDashboard(currentTicker);
            }
        });
        
        portfolioList.appendChild(item);
    });
    
    totalValEl.textContent = `$${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

async function updateDashboard(ticker) {
    const priceEl = document.getElementById('price');
    const changeEl = document.getElementById('price-change');
    const newsList = document.getElementById('news-list');
    const holdingsInput = document.getElementById('holdings-input');
    
    // Set holdings input value for the current ticker (blank if none owned)
    if (holdingsInput) {
        holdingsInput.value = holdings[ticker.toUpperCase()] || '';
    }

    // Set all stats to loading
    const statElements = ['open', 'close', 'high', 'low', 'volume', 'mktcap'];
    statElements.forEach(id => {
        const el = document.getElementById(`stat-${id}`);
        if (el) el.textContent = 'Loading...';
    });

    priceEl.textContent = 'Loading...';
    changeEl.textContent = '--';
    newsList.innerHTML = '<li>Loading...</li>';

    // Build unique list of tickers we need prices for: active ticker + all held tickers
    const tickersToFetch = [ticker, ...Object.keys(holdings)];
    
    const [quotes, news] = await Promise.all([
        fetchQuotes(tickersToFetch),
        fetchNews(ticker)
    ]);

    // Populate local price cache
    quotes.forEach(q => {
        if (q.symbol && q.last) {
            priceCache[q.symbol.toUpperCase()] = parseFloat(q.last);
        }
    });

    // Find active quote
    const quote = quotes.find(q => q.symbol && q.symbol.toUpperCase() === ticker.toUpperCase());

    // Render Price and Stats
    if (quote && quote.last) {
        // Update header details dynamically
        document.getElementById('company-name').textContent = quote.name || `${ticker.toUpperCase()} Inc.`;
        document.getElementById('ticker-display').textContent = quote.symbol || ticker.toUpperCase();
        document.getElementById('exchange-display').textContent = quote.exchange || 'NASDAQ';

        const lastVal = parseFloat(quote.last);
        priceEl.textContent = isNaN(lastVal) ? quote.last : `$${lastVal.toFixed(2)}`;
        
        changeEl.textContent = `${quote.change || '0.00'} (${quote.change_pct || '0.00%'})`;
        const isUp = quote.changetype === 'UP' || parseFloat(quote.change) >= 0;
        changeEl.className = isUp ? 'change-tag price-up' : 'change-tag price-down';

        document.getElementById('stat-open').textContent = quote.open || 'N/A';
        document.getElementById('stat-close').textContent = quote.previous_day_closing || 'N/A';
        document.getElementById('stat-high').textContent = quote.high || 'N/A';
        document.getElementById('stat-low').textContent = quote.low || 'N/A';
        document.getElementById('stat-volume').textContent = quote.volume || 'N/A';
        document.getElementById('stat-mktcap').textContent = quote.mktcapView || 'N/A';
    } else {
        priceEl.textContent = '$Error';
        changeEl.textContent = 'Error';
        changeEl.className = 'change-tag';
        
        // Update basic ticker display on error
        document.getElementById('company-name').textContent = 'Ticker Not Found';
        document.getElementById('ticker-display').textContent = ticker.toUpperCase();
        document.getElementById('exchange-display').textContent = 'Unknown';
        
        statElements.forEach(id => {
            document.getElementById(`stat-${id}`).textContent = 'Error';
        });
    }

    // Refresh portfolio holdings rendering
    renderPortfolio();

    // Render news items
    newsList.innerHTML = '';
    if (news.length === 0) {
        newsList.innerHTML = '<li>No news available</li>';
    } else {
        news.forEach((item, index) => {
            const li = document.createElement('li');
            
            const a = document.createElement('a');
            a.href = item.url;
            a.textContent = item.title;
            a.target = '_blank';
            li.appendChild(a);
            
            // Container for the simulated AI summary
            const summaryContainer = document.createElement('div');
            li.appendChild(summaryContainer);
            
            newsList.appendChild(li);
            
            // Run the animated AI summary simulation
            renderAISummary(summaryContainer, item.description, index);
        });
    }
}

function updateClock() {
    const datetimePill = document.getElementById('datetime-pill');
    if (!datetimePill) return;
    
    const now = new Date();
    const options = { 
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    const formatted = now.toLocaleString('en-US', options);
    // Format to: Month DD, YYYY • HH:MM AM/PM
    datetimePill.innerHTML = `<span class="clock-icon">🕒</span> ${formatted.replace(',', ' •').replace(/,/g, '')}`;
}

function init() {
    const form = document.getElementById('ticker-form');
    const input = document.getElementById('ticker-input');
    const holdingsInput = document.getElementById('holdings-input');

    // Ensure new default tickers are seeded for existing users
    const newDefaults = {
        'CSCO': 100,
        'GOOG': 10,
        'LMT': 5,
        'VZ': 50,
        'T': 100,
        'NVDA': 20,
        'PANW': 10,
        'F': 150,
        'HPQ': 80,
        'TM': 30,
        'TSM': 25
    };
    const seeded = localStorage.getItem('csco_portfolio_seeded_v3');
    if (!seeded) {
        holdings = { ...newDefaults };
        saveHoldings();
        localStorage.setItem('csco_portfolio_seeded_v3', 'true');
    }

    // Ticker Search Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ticker = input.value.trim().toUpperCase();
        if (ticker) {
            currentTicker = ticker;
            updateDashboard(ticker);
            input.value = ''; // Clear input
        }
    });

    // Holdings input change
    holdingsInput.addEventListener('input', () => {
        const val = parseFloat(holdingsInput.value);
        if (isNaN(val) || val <= 0) {
            delete holdings[currentTicker];
        } else {
            holdings[currentTicker] = val;
        }
        saveHoldings();
        renderPortfolio();
    });

    // Start clock updating
    updateClock();
    setInterval(updateClock, 1000);

    // Initial load
    updateDashboard(currentTicker);
}

document.addEventListener('DOMContentLoaded', init);