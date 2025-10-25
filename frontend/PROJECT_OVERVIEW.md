# 🎯 ClearView AI - Project Overview

## 📋 What We Built

A modern, professional React dashboard for the **ClearView AI** hackathon project - an AI-powered software lifecycle management tool.

---

## ✅ Completed Tasks

### 1. ✨ Figma Design Prompts
Created 5 detailed prompts for Figma Make to design:
- Main dashboard layout with dark mode
- Upload card with dropzone
- KPI metric cards with trend indicators
- Charts section (bar & donut)
- Data table with search and filters

### 2. 🎨 Tech Stack Setup
- **React 18** with **Vite** for fast development
- **Tailwind CSS v3** for utility-first styling
- **Axios** for API communication
- **Chart.js** with React wrappers for visualizations
- **Lucide React** for beautiful icons
- Modern dark theme with shadcn UI aesthetics

### 3. 🧩 UI Components (shadcn-style)

#### `Sidebar.jsx`
- Dark mode navigation
- Active state indicators
- Collapsible folder sections
- Modern icon set

#### `UploadPanel.jsx`
- Drag & drop file upload
- Click to browse
- File type validation (CSV/JSON)
- Visual feedback on file selection
- Action buttons (Normalize, Compute EOS)
- Loading states

#### `KPIs.jsx`
- 4 metric cards with icons
- Large number display
- Trend indicators (up/down arrows)
- Color-coded changes (green/red)
- Supports custom formatting (currency, percentage)

#### `RiskCharts.jsx`
- **Bar Chart**: Software by manufacturer
- **Donut Chart**: Risk categories with legend
- Responsive design
- Custom colors matching theme
- Chart.js integration

#### `RecordsTable.jsx`
- Sortable columns (click headers)
- Search functionality
- Risk badges (Critical, Warning, Safe)
- Export button
- Responsive design
- Hover effects

#### `Toolbar.jsx`
- Breadcrumb navigation
- Home icon with path

#### `Toast.jsx`
- Success, error, warning, info types
- Auto-dismiss with configurable duration
- Icon indicators
- Close button
- Slide-in animation
- Stacked notifications

### 4. 🔌 API Integration

#### `api.js`
- Axios instance with interceptors
- All endpoints configured:
  - Auritas Viz endpoints (preview, render, export)
  - Gemini AI endpoint (extract-software)
  - Main app endpoints (ingest, normalize, eos, summary, records, export)
- Error handling
- CORS support

#### Custom Hooks

**`useApi.js`**
```javascript
const { data, loading, error, execute } = useApi(api.normalize);
```
- Manages API calls with loading/error states
- Reusable for any API function
- Built-in error handling

**`usePolling.js`**
```javascript
const { data, loading, error, refetch } = usePolling(api.getSummary, 5000, true);
```
- Auto-refresh data at intervals
- Enable/disable polling
- Manual refetch option

**`useToast.js`**
```javascript
const { success, error, info, warning } = useToast();
```
- Toast notification system
- Multiple types
- Auto-dismiss
- Queue management

### 5. 🎨 Layout & Design

#### Main Layout (`App.jsx`)
```
┌─────────────────────────────────────────────────┐
│  Sidebar  │  Toolbar (Breadcrumb)               │
├───────────┼─────────────────────────────────────┤
│           │  ┌─────────┐  ┌─────────────────┐  │
│  Nav      │  │ Upload  │  │   KPI Cards     │  │
│  Items    │  │ Panel   │  │  (4 metrics)    │  │
│           │  └─────────┘  └─────────────────┘  │
│           │  ┌─────────────┬─────────────────┐ │
│  Folders  │  │  Bar Chart  │  Donut Chart    │ │
│           │  └─────────────┴─────────────────┘ │
│           │  ┌───────────────────────────────┐ │
│           │  │     Data Table                │ │
│           │  │  (Search, Sort, Export)       │ │
│           │  └───────────────────────────────┘ │
└───────────┴─────────────────────────────────────┘
```

#### Color Scheme
- Background: `#0F0F10`
- Cards: `#1A1A1B`
- Borders: `#2A2A2B`
- Primary Blue: `#3B82F6`
- Success Green: `#10B981`
- Warning Orange: `#F59E0B`
- Danger Red: `#EF4444`

### 6. 🚀 Deployment Configuration

#### Vercel Setup
- `vercel.json` configured with API rewrites
- CORS headers setup
- Environment variables documented

#### Ready to Deploy
```bash
# Quick deploy
vercel

# Production
vercel --prod
```

### 7. 📚 Documentation

#### `README.md`
- Complete project overview
- Tech stack details
- Component documentation
- API integration guide
- Build & deployment instructions

#### `QUICKSTART.md`
- 5-minute setup guide
- Testing flow
- Troubleshooting tips
- API testing with curl

#### `DEPLOYMENT.md`
- Vercel deployment (CLI & GitHub)
- Netlify alternative
- AWS S3 + CloudFront guide
- Custom domain setup
- Pre-deployment checklist

### 8. 📦 Extras

- **Sample CSV data** (`sample-data.csv`) for testing
- **Environment variables** template
- **Git repository** initialized with clean commit
- **Production build tested** and working
- **Utility functions** for formatting (currency, dates, numbers)

---

## 📂 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── KPIs.jsx
│   │   ├── RecordsTable.jsx
│   │   ├── RiskCharts.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Toast.jsx
│   │   ├── Toolbar.jsx
│   │   └── UploadPanel.jsx
│   ├── hooks/            # Custom hooks
│   │   ├── useApi.js
│   │   ├── usePolling.js
│   │   └── useToast.js
│   ├── lib/              # Utilities
│   │   ├── api.js
│   │   └── utils.js
│   ├── App.jsx           # Main app
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── DEPLOYMENT.md         # Deploy guide
├── QUICKSTART.md         # Quick start
├── README.md             # Main docs
├── PROJECT_OVERVIEW.md   # This file
├── sample-data.csv       # Test data
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

---

## 🎯 Features Summary

### User Flow
1. **Upload CSV/JSON** → Drag & drop or click to browse
2. **Normalize Data** → AI cleans and standardizes
3. **Compute EOS** → Calculate End-of-Support dates
4. **View Analytics** → KPIs, charts, detailed table
5. **Export Results** → Download cleaned CSV

### Dashboard Components
- ✅ 4 KPI cards with trend indicators
- ✅ Bar chart (software by manufacturer)
- ✅ Donut chart (risk categories)
- ✅ Searchable, sortable data table
- ✅ Toast notifications
- ✅ File upload with drag & drop
- ✅ Export functionality

### Technical Features
- ✅ React 18 with hooks
- ✅ Responsive design (mobile-friendly)
- ✅ Dark mode UI
- ✅ API integration ready
- ✅ Error handling
- ✅ Loading states
- ✅ TypeScript-ready structure
- ✅ Production build optimized
- ✅ Vercel deployment configured

---

## 🚀 Quick Commands

```bash
# Install
npm install

# Development
npm run dev          # → http://localhost:5173

# Build
npm run build        # → dist/

# Preview
npm run preview      # → http://localhost:4173

# Deploy
vercel              # Deploy to Vercel
```

---

## 🔗 API Endpoints Integration

All endpoints are configured and ready to use:

### Upload & Process
- `POST /api/ingest` - Upload CSV/JSON file
- `POST /api/normalize` - AI normalize data
- `POST /api/eos` - Compute EOS dates

### Retrieve Data
- `GET /api/summary` - Dashboard summary
- `GET /api/records` - Filtered records
- `GET /api/export` - Export CSV

### Auritas Viz
- `POST /api/auritas/viz/preview` - Preview CSV text
- `POST /api/auritas/viz/preview-file` - Upload CSV
- `POST /api/auritas/viz/render` - Transform CSV
- `GET /api/auritas/viz/export` - Download transformed

### Gemini AI
- `POST /api/gemini/extract-software` - Parse software data

---

## 🎨 Design System

### Typography
- Font: Inter (Google Fonts)
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Card padding: `p-6` (1.5rem)
- Grid gaps: `gap-4` or `gap-6`
- Section spacing: `space-y-6`

### Components Style
- Cards: Dark background with subtle borders
- Buttons: Rounded with hover effects
- Badges: Rounded-full with color-coded backgrounds
- Charts: Custom colors matching theme
- Tables: Hover effects, alternating rows

---

## 📊 Demo Data Included

Sample CSV with 10 records:
- Multiple vendors (Microsoft, Adobe, Oracle, SAP, etc.)
- Various risk levels (Safe, Warning, Critical)
- Realistic EOS dates and costs
- Ready to test upload functionality

---

## 🎯 Hackathon Ready

This project is **100% ready** for your hackathon demo:

- ✅ Professional UI/UX
- ✅ Working components
- ✅ API integration setup
- ✅ Sample data included
- ✅ Documentation complete
- ✅ Easy to deploy
- ✅ Git commits clean
- ✅ Build tested and passing

---

## 🏆 Next Steps

1. **Start backend server** (see `../backend/`)
2. **Run frontend** (`npm run dev`)
3. **Test the flow** with sample CSV
4. **Customize** branding/colors if needed
5. **Deploy** to Vercel
6. **Present** to judges! 🎤

---

## 💡 Tips for Demo

1. Show the **upload flow** first
2. Highlight **AI normalization** feature
3. Emphasize **data visualization** (charts)
4. Demonstrate **search & export**
5. Mention **scalability** and **real-time updates**

---

## 🆘 Support

Check documentation:
- `README.md` - Full guide
- `QUICKSTART.md` - Fast setup
- `DEPLOYMENT.md` - Deploy guide

Or review code comments in components!

---

**Built with ❤️ for BNY Mellon Hackathon 2025**

**Team:** ClearView AI  
**Tech:** React + Vite + Tailwind + Chart.js + Axios  
**Status:** ✅ Production Ready

