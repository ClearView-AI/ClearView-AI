# ClearView AI - Frontend

Modern React dashboard for AI-powered software lifecycle management.

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Lucide React** - Icon library

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── KPIs.jsx        # KPI cards
│   ├── RecordsTable.jsx # Data table
│   ├── RiskCharts.jsx  # Charts (Bar & Donut)
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Toast.jsx       # Toast notifications
│   ├── Toolbar.jsx     # Top breadcrumb bar
│   └── UploadPanel.jsx # File upload zone
├── hooks/              # Custom React hooks
│   ├── useApi.js       # API calls wrapper
│   ├── usePolling.js   # Polling hook
│   └── useToast.js     # Toast notifications
├── lib/                # Utilities
│   ├── api.js          # Axios instance & endpoints
│   └── utils.js        # Helper functions
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Components

### UploadPanel
- Drag & drop file upload
- CSV/JSON support
- Normalize & EOS action buttons

### KPIs
- 4 metric cards
- Trend indicators
- Icon support

### RiskCharts
- Bar chart: Software by manufacturer
- Donut chart: Risk categories with legend

### RecordsTable
- Sortable columns
- Search functionality
- Export to CSV
- Risk badges

### Toast
- Success, error, warning, info types
- Auto-dismiss
- Multiple toasts support

## 🔌 API Integration

All endpoints are configured in `src/lib/api.js`:

### Auritas Viz Endpoints
- `POST /api/auritas/viz/preview` - Preview CSV from text
- `POST /api/auritas/viz/preview-file` - Upload CSV file
- `POST /api/auritas/viz/render` - Transform CSV
- `GET /api/auritas/viz/export` - Download transformed CSV

### Gemini Endpoints
- `POST /api/gemini/extract-software` - Parse software using AI

### Main App Endpoints
- `POST /api/ingest` - Upload file
- `POST /api/normalize` - Normalize data
- `POST /api/eos` - Compute EOS dates
- `GET /api/summary` - Get dashboard summary
- `GET /api/records` - Get records list
- `GET /api/export` - Export data

## 🎯 Custom Hooks

### useApi
```jsx
const { data, loading, error, execute } = useApi(api.normalize);

const handleClick = async () => {
  await execute();
};
```

### usePolling
```jsx
const { data, loading, error, refetch } = usePolling(
  api.getSummary,
  5000,     // interval in ms
  true      // enabled
);
```

### useToast
```jsx
const { success, error, info, warning } = useToast();

success('Operation completed!');
error('Something went wrong!');
```

## 🏗️ Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` - Your backend API URL

### Or use Vercel GitHub Integration

1. Push to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy automatically on push

## 🎨 Styling

The project uses a custom dark theme with shadcn UI aesthetics:

- Background: `#0F0F10`
- Card: `#1A1A1B`
- Border: `#2A2A2B`
- Primary: `#3B82F6`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

## 📝 License

Built for BNY Mellon Hackathon 2025
