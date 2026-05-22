# CSCO Live Finance Dashboard

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-blue?style=flat-square&logo=github)](https://btaira.github.io/finance-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

A beautiful, real-time stock market dashboard built with vanilla JavaScript, HTML, and CSS. Track stock prices, manage your portfolio, and stay updated with the latest financial news—all in one elegant interface.

🌐 **[Live Demo](https://btaira.github.io/finance-app)** - Deploy your own via GitHub Pages or Docker

## Features

🎯 **Live Stock Price Tracking**
- Real-time stock quotes from CNBC API
- Display key metrics: open, close, high, low, volume, and market cap
- Color-coded price changes (green for gains, red for losses)
- Instant ticker search functionality

📊 **Portfolio Management**
- Track multiple stock holdings in one place
- Real-time portfolio valuation
- Click any holding to view detailed information
- Persistent storage using browser localStorage

📰 **Latest Market News**
- Fetch the 5 most recent news articles for any ticker
- AI-powered insights that summarize article descriptions
- Direct links to full articles
- Cascading animation effect for summaries

⏰ **Live Clock Display**
- Current date and time in the header
- Updates every second
- Clean, minimalist design with emoji clock icon

🎨 **Modern UI Design**
- Dark gradient background with glassmorphism effects
- Responsive layout for mobile and desktop
- Smooth hover effects and transitions
- Professional typography using Inter font

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **APIs**: 
  - CNBC Stock Quotes API
  - Yahoo Finance RSS Feed (via rss2json proxy)
- **Storage**: Browser localStorage for portfolio persistence
- **Containerization**: Docker with Nginx

## Getting Started

### Local Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-app
```

2. Open in your browser:
   - Simply open `index.html` in any modern web browser
   - No build step required!

3. Start exploring:
   - The dashboard loads with default holdings (CSCO, GOOG, LMT, VZ, T, NVDA, PANW, F, HPQ, TM, TSM)
   - Enter a ticker symbol to search for a stock
   - Click any holding in "My Holdings" to view its details
   - Adjust your share count in the "Shares Owned" input

### Docker Deployment

#### One-Shot Container (Recommended)

Build and run the container in one command:

```bash
docker build -t csco-finance . && docker run -d --name csco-finance -p 80:80 csco-finance
```

Access at: `http://127.0.0.1`

#### Using Custom Hostname (csco-finance)

To access the dashboard using a friendly hostname instead of localhost:

**1. Add hostname to Windows hosts file:**
- Open Notepad as Administrator
- Go to File → Open → `C:\Windows\System32\drivers\etc\hosts`
- Find this line: `127.0.0.1 kubernetes.docker.internal`
- Change it to: `127.0.0.1 kubernetes.docker.internal csco-finance`
- Save the file
- Run in PowerShell: `ipconfig /flushdns`

**2. Access your dashboard:**
```
http://csco-finance
```

#### Stop & Remove Container

```bash
docker stop csco-finance
docker rm csco-finance
```

### GitHub Pages Deployment

Deploy instantly to GitHub Pages with automatic CI/CD:

**1. Fork or use this repository**

**2. Enable GitHub Pages:**
- Go to Settings → Pages
- Source: `Deploy from a branch`
- Branch: `main`, folder: `/root`
- Click Save

**3. Done!** 🚀
- Your dashboard is live at: `https://<your-username>.github.io/finance-app`
- Automatic deployments on every push to `main` branch
- Uses GitHub Actions workflow (`.github/workflows/deploy.yml`)

No additional setup needed—just push code and it deploys automatically!

## Project Structure

```
finance-app/
├── index.html       # HTML structure and layout
├── style.css        # Styling and animations
├── script.js        # Core functionality and API integration
├── nginx.conf       # Nginx configuration for Docker deployment
├── Dockerfile       # Docker configuration for deployment
└── README.md        # This file
```

## File Descriptions

### [index.html](index.html)
The main HTML structure containing:
- Dashboard header with company info and search form
- Live price section with portfolio manager
- Market summary statistics grid
- News section for latest articles
- Dynamic content areas that are populated by JavaScript

### [script.js](script.js)
Core application logic:
- `fetchQuotes()` - Fetches stock prices from CNBC API
- `fetchNews()` - Retrieves latest news articles via Yahoo Finance RSS
- `updateDashboard()` - Refreshes all dashboard content for a given ticker
- `renderPortfolio()` - Displays portfolio holdings with valuations
- `renderAISummary()` - Creates animated AI insights from news descriptions
- Portfolio management with localStorage persistence
- Real-time clock updates

### [style.css](style.css)
Complete styling including:
- Dark theme with gradient background
- Glassmorphism design with backdrop filters
- Responsive grid layout
- Animations (pulse, spin, fadeIn)
- Mobile-first responsive design
- Scrollable portfolio list with custom scrollbar

### [nginx.conf](nginx.conf)
Nginx web server configuration that:
- Serves static files from `/usr/share/nginx/html`
- Configures MIME types for proper CSS/JS delivery
- Handles SPA routing with try_files fallback
- Caches static assets with proper headers
- Listens on port 80 with server name `csco-finance`

### [Dockerfile](Dockerfile)
Docker configuration that:
- Uses lightweight Alpine Nginx image
- Copies custom nginx.conf configuration
- Copies all static files to Nginx serving directory
- Exposes port 80
- Runs Nginx in foreground mode

## Key Features Explained

### Portfolio Management
Your portfolio holdings are saved to browser localStorage under the key `csco_portfolio_holdings`. The app maintains a default portfolio of 11 tech and telecom stocks:
- CSCO, GOOG, LMT, VZ, T, NVDA, PANW, F, HPQ, TM, TSM

Adjust share quantities in the "Shares Owned" input to update your portfolio.

### Price Caching
The app maintains an in-memory price cache to efficiently display your portfolio valuation without making unnecessary API calls. Prices are fetched once when the dashboard updates.

### AI Summaries
Article summaries are generated by:
1. Extracting key sentences from news descriptions
2. Formatting them as bullet points
3. Cascading them in with a loading animation for visual polish

### Data Persistence
- Portfolio holdings persist across browser sessions via localStorage
- A seeding system ensures new default tickers are added when you first load the app
- No backend or database required!

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- CSS Backdrop Filters (with fallbacks)
- LocalStorage API
- Fetch API

## API Dependencies

This app relies on two external APIs:

1. **CNBC Stock Quotes**
   - URL: `quote.cnbc.com`
   - No authentication required
   - Real-time stock data

2. **Yahoo Finance RSS via rss2json proxy**
   - Primary: `feeds.finance.yahoo.com` (RSS)
   - Proxy: `api.rss2json.com` (to work around CORS)
   - Latest news articles and headlines

## Troubleshooting

### Docker & Deployment

**Dashboard shows white background without styling**
- This happens when CSS is served with wrong MIME type (`text/plain` instead of `text/css`)
- Verify nginx.conf includes: `include /etc/nginx/mime.types;`
- Rebuild container: `docker build -t csco-finance . && docker run -d --name csco-finance -p 80:80 csco-finance`

**Cannot access http://csco-finance**
- Verify hosts file entry: `127.0.0.1 kubernetes.docker.internal csco-finance`
- Flush DNS cache: `ipconfig /flushdns`
- Try using `http://127.0.0.1` directly instead

**Container keeps exiting**
- Check logs: `docker logs csco-finance`
- Verify Dockerfile copies nginx.conf: `COPY nginx.conf /etc/nginx/nginx.conf`
- Ensure no port conflicts: `docker ps -a`

### Browser Issues

**Page displays poorly or looks unstyled in browser**
- Clear browser cache: `Ctrl + Shift + Delete` → Clear all browsing data
- Hard refresh: `Ctrl + Shift + R`
- Try incognito/private mode: `Ctrl + Shift + N`

**"Ticker Not Found"**
- Ensure the ticker symbol is correct and exists
- Check your internet connection
- The stock may not have data available in CNBC's API

**No news articles appearing**
- RSS feed might be temporarily unavailable
- Try searching for a different ticker
- Check browser console (F12) for CORS or fetch errors

**Portfolio not saving**
- Verify localStorage is enabled in your browser
- Check browser privacy settings
- Clear cache and reload

## Future Enhancements

Potential improvements:
- Historical price charts using a charting library
- Stock watchlist functionality
- Performance analytics for your portfolio
- Alert notifications for price changes
- Dark/light theme toggle
- Multi-currency support

## License

This project is open source and available for personal and educational use.

## Author

Created as a real-time finance dashboard for tracking stock investments with a modern, clean interface.

---

**Start tracking your investments today!** 📈
