# ⚡ Quick Start Guide

Get your ClearView AI dashboard up and running in 5 minutes!

## 🎯 Prerequisites

- Node.js 18+ installed
- Backend API running (see `../backend/README.md`)
- Code editor (VS Code recommended)

## 🚀 Setup

### 1. Install Dependencies

```bash
cd /Users/goliveira/Developer/Projects/ClearView/ClearView-AI/frontend
npm install
```

### 2. Configure Environment

Create a `.env` file (or use the existing one):

```bash
VITE_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. 🎉

## 🎨 What You'll See

The dashboard includes:

1. **Left Sidebar** - Navigation menu
2. **Upload Panel** (top-left) - Drag & drop CSV/JSON files
3. **KPI Cards** (top-right) - Key metrics at a glance
4. **Bar Chart** (middle-left) - Software by manufacturer
5. **Donut Chart** (middle-right) - Risk categories breakdown
6. **Data Table** (bottom) - Searchable software inventory

## 🔌 Connect to Backend

### Make sure your backend is running:

```bash
cd ../backend
npm run dev
```

Backend should be running on `http://localhost:3000`

## 📝 Test the Flow

1. **Upload a CSV file:**
   - Click or drag a CSV file to the upload zone
   - Sample format:
     ```csv
     Vendor,Product,Version,EOS Date,Risk,Cost
     Microsoft,Windows Server,2012 R2,2023-10-10,Critical,15000
     Adobe,Creative Cloud,2023,2026-12-31,Safe,8500
     ```

2. **Normalize Data:**
   - Click "Normalize Data" button
   - AI will clean and standardize the data

3. **Compute EOS:**
   - Click "Compute EOS" button
   - System will calculate End-of-Support dates

4. **View Results:**
   - KPIs will update with new metrics
   - Charts will visualize the data
   - Table will show detailed records

5. **Export Data:**
   - Click "Export" button in the table
   - Download cleaned CSV file

## 🛠️ Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code (if configured)
npm run lint
```

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6',  // Blue
      success: '#10B981',  // Green
      warning: '#F59E0B',  // Orange
      danger: '#EF4444',   // Red
    },
  },
}
```

### Modify API Endpoints

Edit `src/lib/api.js` to add or modify endpoints.

### Add New Components

1. Create component in `src/components/YourComponent.jsx`
2. Import in `src/App.jsx`
3. Add to the layout

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
# Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Or run on different port
npm run dev -- --port 3001
```

### API calls failing
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Changes not reflecting
- Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
- Clear browser cache
- Restart dev server

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Next Steps

- [ ] Deploy to Vercel (see `DEPLOYMENT.md`)
- [ ] Connect to real backend API
- [ ] Customize branding and colors
- [ ] Add more charts or features
- [ ] Set up analytics tracking

## 🎯 API Endpoint Testing

Use these curl commands to test backend connectivity:

```bash
# Test summary endpoint
curl http://localhost:3000/api/summary

# Test file upload
curl -X POST http://localhost:3000/api/ingest \
  -F "file=@sample.csv"

# Test normalize
curl -X POST http://localhost:3000/api/normalize

# Test EOS computation
curl -X POST http://localhost:3000/api/eos
```

## 💡 Tips

- **Hot Reload**: Changes to React components auto-reload
- **Console Logs**: Open browser DevTools (F12) to see API responses
- **Network Tab**: Monitor API calls in DevTools → Network
- **React DevTools**: Install the browser extension for debugging

## 🆘 Need Help?

- Check `README.md` for full documentation
- Review component code in `src/components/`
- Check backend API documentation
- Inspect browser console for errors

---

**Happy Hacking! 🚀**

Built for BNY Mellon Hackathon 2025

