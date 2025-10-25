# ClearView Backend - Setup & Deployment Guide

## 📁 File Structure

```
backend/
├── src/
│   ├── index.ts                    # Main Express app (UPDATED)
│   ├── auritas.ts                  # CSV processing logic (existing)
│   ├── transforms.ts               # Transform functions (existing)
│   │
│   ├── routes/                     # NEW - Route handlers
│   │   ├── auritas.routes.ts      # Auritas viz endpoints
│   │   └── gemini.routes.ts       # Gemini AI endpoints
│   │
│   ├── services/                   # NEW - Business logic
│   │   ├── gemini.service.ts      # Gemini API integration
│   │   └── file.service.ts        # File handling utilities
│   │
│   ├── middleware/                 # NEW - Express middleware
│   │   └── upload.middleware.ts   # Multer file upload config
│   │
│   └── types/                      # NEW - TypeScript types
│       └── api.types.ts            # API request/response types
│
├── recipes/                        # Recipe JSON files
│   └── sap_example_screen.json
│
├── prisma/                         # Database
│   ├── schema.prisma
│   └── migrations/
│
├── API_DOCUMENTATION.md            # NEW - Full API docs
├── SETUP_GUIDE.md                  # This file
├── package.json                    # UPDATED - Added dependencies
├── .env                            # UPDATED - Added GEMINI_API_KEY
└── tsconfig.json
```

---

## 🚀 Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- ✅ `@google/generative-ai` - Gemini API SDK
- ✅ `multer` - File upload middleware
- ✅ All existing dependencies (express, prisma, etc.)

### 2. Set Up Environment Variables

Edit `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=5052

# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="your-api-key-here"
```

**Get Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy and paste into `.env`

### 3. Initialize Database

```bash
npm run prisma
```

This runs:
- Prisma migrations
- Generates Prisma Client

### 4. Start Development Server

```bash
npm run dev
```

Server runs on: `http://localhost:5052`

---

## 🧪 Testing Endpoints

### Test Health Check
```bash
curl http://localhost:5052/health
```

### Test CSV Upload (Text)
```bash
curl -X POST http://localhost:5052/api/auritas/viz/preview \
  -H "Content-Type: application/json" \
  -d '{
    "csvText": "Name,Age,City\nJohn,30,NYC\nJane,25,LA",
    "filename": "test.csv"
  }'
```

### Test File Upload
```bash
curl -X POST http://localhost:5052/api/auritas/viz/preview-file \
  -F "file=@path/to/your/file.csv"
```

### Test Gemini Extraction
```bash
curl -X POST http://localhost:5052/api/gemini/extract-software \
  -H "Content-Type: application/json" \
  -d '{
    "rawText": "Microsoft Office 365 v16.0"
  }'
```

### Test Gemini Health
```bash
curl http://localhost:5052/api/gemini/health
```

---

## 📋 All Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/auritas/viz/preview` | POST | Preview CSV from text |
| `/api/auritas/viz/preview-file` | POST | Upload CSV file |
| `/api/auritas/viz/render` | POST | Transform CSV with field map |
| `/api/auritas/viz/export` | GET | Download transformed CSV |
| `/api/gemini/extract-software` | POST | Extract software info with AI |
| `/api/gemini/extract-batch` | POST | Batch extract software info |
| `/api/gemini/health` | GET | Check Gemini API status |

**Full documentation**: `API_DOCUMENTATION.md`

---

## 🔧 Development

### File Organization

**Routes** (`src/routes/`)
- Handle HTTP requests
- Validate input
- Call service layer
- Return responses

**Services** (`src/services/`)
- Business logic
- External API calls (Gemini)
- Data processing
- No HTTP knowledge

**Middleware** (`src/middleware/`)
- Request preprocessing
- File uploads
- Authentication (future)

**Types** (`src/types/`)
- TypeScript interfaces
- Request/response types
- Type safety across app

### Adding New Endpoints

1. **Create route handler** in `src/routes/`
2. **Add business logic** in `src/services/`
3. **Define types** in `src/types/api.types.ts`
4. **Register route** in `src/index.ts`
5. **Document** in `API_DOCUMENTATION.md`

Example:
```typescript
// src/routes/myfeature.routes.ts
import { Router } from "express";

const router = Router();

router.post("/my-endpoint", async (req, res) => {
  // Handle request
});

export default router;

// src/index.ts
import myFeatureRoutes from "./routes/myfeature.routes";
app.use("/api/myfeature", myFeatureRoutes);
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5052
lsof -ti:5052 | xargs kill -9

# Or change port in .env
PORT=5053
```

### Multer "Unexpected field" Error
Make sure form field name is `file`:
```bash
curl -F "file=@data.csv" ...
```

### Gemini API Not Working
1. Check API key in `.env`
2. Verify key at https://makersuite.google.com
3. Check `/api/gemini/health` endpoint
4. Fallback mode will activate automatically

### TypeScript Errors
```bash
# Regenerate Prisma Client
npx prisma generate

# Clean build
rm -rf dist
npm run build
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run prisma
```

---

## 📦 Production Deployment

### Build for Production

```bash
npm run build
```

Generates compiled JS in `dist/` folder.

### Run Production Server

```bash
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db"
PORT=5052
GEMINI_API_KEY="prod-key"
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5052
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t clearview-backend .
docker run -p 5052:5052 --env-file .env clearview-backend
```

---

## 🔐 Security Checklist (Production)

- [ ] Add API rate limiting
- [ ] Implement authentication (JWT/API keys)
- [ ] Validate all inputs
- [ ] Enable CORS whitelist
- [ ] Use HTTPS only
- [ ] Sanitize file uploads
- [ ] Add request logging
- [ ] Monitor error rates
- [ ] Implement API versioning
- [ ] Add health monitoring

---

## 📊 Monitoring

### Log Files
```bash
# View server logs
npm run dev | tee server.log

# View error logs
tail -f server.log | grep ERROR
```

### Performance Monitoring
```bash
# Install PM2 for production
npm install -g pm2

# Start with monitoring
pm2 start dist/index.js --name clearview-backend
pm2 monit
```

---

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Add JSDoc comments
- Write descriptive error messages

### Git Workflow
```bash
git checkout -b feature/my-feature
git commit -m "feat: add new endpoint"
git push origin feature/my-feature
```

---

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Multer Docs](https://github.com/expressjs/multer)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✅ Quick Checklist

Before demo/submission:

- [ ] All dependencies installed
- [ ] Database migrated
- [ ] `.env` configured with API key
- [ ] Server starts without errors
- [ ] All endpoints tested
- [ ] API documentation reviewed
- [ ] Frontend can connect to backend
- [ ] Sample CSV files ready
- [ ] Error handling tested

---

## 🎉 You're Ready!

Backend is fully set up with:
✅ 8 API endpoints  
✅ File upload support  
✅ Gemini AI integration  
✅ Complete documentation  
✅ TypeScript type safety  
✅ Modular architecture  

Start the server and test the endpoints:
```bash
npm run dev
```

Check the API docs: `API_DOCUMENTATION.md`

---

**Built for KnightHacks 2025 | Team ClearView**
