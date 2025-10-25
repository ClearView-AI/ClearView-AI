# ClearView Backend - Complete File Structure

## 📂 Directory Tree

```
backend/
├── �� package.json              ✅ UPDATED - Added @google/generative-ai, multer
├── 📄 tsconfig.json             ✅ Existing
├── 📄 .env                      ✅ UPDATED - Added GEMINI_API_KEY
├── 📄 .gitignore                ✅ Existing
├── 📄 prisma.config.ts          ✅ Existing
│
├── 📁 prisma/
│   ├── schema.prisma            ✅ Existing
│   └── migrations/              ✅ Existing
│
├── 📁 recipes/
│   └── sap_example_screen.json  ✅ Existing
│
├── 📁 src/
│   ├── 📄 index.ts              ✅ UPDATED - Uses new route structure
│   ├── 📄 auritas.ts            ✅ Existing - CSV processing
│   ├── 📄 transforms.ts         ✅ Existing - Transform functions
│   │
│   ├── 📁 routes/               🆕 NEW FOLDER
│   │   ├── auritas.routes.ts   🆕 Auritas viz endpoints
│   │   └── gemini.routes.ts    🆕 Gemini AI endpoints
│   │
│   ├── 📁 services/             🆕 NEW FOLDER
│   │   ├── gemini.service.ts   🆕 Gemini API integration
│   │   └── file.service.ts     🆕 File upload utilities
│   │
│   ├── �� middleware/           🆕 NEW FOLDER
│   │   └── upload.middleware.ts 🆕 Multer config
│   │
│   └── 📁 types/                🆕 NEW FOLDER
│       └── api.types.ts        🆕 TypeScript interfaces
│
├── 📄 API_DOCUMENTATION.md      🆕 Complete API docs
├── 📄 SETUP_GUIDE.md            🆕 Setup & deployment guide
└── 📄 FILE_STRUCTURE.md         🆕 This file
```

---

## 📝 File Purposes

### Root Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `package.json` | Dependencies & scripts | ✅ Updated |
| `tsconfig.json` | TypeScript config | ✅ Existing |
| `.env` | Environment variables | ✅ Updated |
| `.gitignore` | Git exclusions | ✅ Existing |
| `prisma.config.ts` | Prisma configuration | ✅ Existing |

### Core Application (`src/`)

| File | Purpose | Status |
|------|---------|--------|
| `index.ts` | Main Express app | ✅ Refactored |
| `auritas.ts` | CSV processing logic | ✅ Existing |
| `transforms.ts` | Transform functions | ✅ Existing |

### Routes (`src/routes/`)

| File | Endpoints | Status |
|------|-----------|--------|
| `auritas.routes.ts` | `/api/auritas/viz/*` | 🆕 New |
| `gemini.routes.ts` | `/api/gemini/*` | 🆕 New |

**Auritas Routes:**
- `POST /preview` - Preview CSV text
- `POST /preview-file` - Upload CSV file
- `POST /render` - Transform CSV
- `GET /export` - Download CSV

**Gemini Routes:**
- `POST /extract-software` - Extract software info
- `POST /extract-batch` - Batch extract
- `GET /health` - API status

### Services (`src/services/`)

| File | Purpose | Status |
|------|---------|--------|
| `gemini.service.ts` | Gemini API calls, AI extraction | 🆕 New |
| `file.service.ts` | File validation, utilities | 🆕 New |

### Middleware (`src/middleware/`)

| File | Purpose | Status |
|------|---------|--------|
| `upload.middleware.ts` | Multer file upload config | 🆕 New |

### Types (`src/types/`)

| File | Purpose | Status |
|------|---------|--------|
| `api.types.ts` | TypeScript interfaces for API | 🆕 New |

### Documentation

| File | Purpose | Status |
|------|---------|--------|
| `API_DOCUMENTATION.md` | Complete API reference | 🆕 New |
| `SETUP_GUIDE.md` | Installation & deployment | 🆕 New |
| `FILE_STRUCTURE.md` | This file | 🆕 New |

---

## 🔄 Code Organization Pattern

```
Request Flow:
1. index.ts → Express app setup
2. routes/*.routes.ts → Handle HTTP requests
3. services/*.service.ts → Business logic
4. auritas.ts / transforms.ts → Core processing
5. Response back to client
```

### Example: File Upload Flow

```
POST /api/auritas/viz/preview-file
    ↓
1. index.ts (Express middleware)
    ↓
2. auritas.routes.ts (Route handler)
    ↓
3. upload.middleware.ts (Multer processes file)
    ↓
4. file.service.ts (Validate & convert)
    ↓
5. auritas.ts (CSV parsing)
    ↓
6. Response with preview data
```

---

## 📦 Dependencies Added

### Production Dependencies
```json
{
  "@google/generative-ai": "^0.21.0",  // Gemini API SDK
  "multer": "^1.4.5-lts.1"              // File uploads
}
```

### DevDependencies
```json
{
  "@types/multer": "^2.0.0"  // TypeScript types for Multer
}
```

---

## 🎯 Key Changes Summary

### Modified Files (3)
1. **src/index.ts**
   - Refactored to use route modules
   - Added error handling
   - Removed inline route definitions

2. **package.json**
   - Added `@google/generative-ai`
   - Added `multer`
   - Added `@types/multer`

3. **.env**
   - Added `GEMINI_API_KEY` variable

### New Files (10)
1. `src/routes/auritas.routes.ts`
2. `src/routes/gemini.routes.ts`
3. `src/services/gemini.service.ts`
4. `src/services/file.service.ts`
5. `src/middleware/upload.middleware.ts`
6. `src/types/api.types.ts`
7. `API_DOCUMENTATION.md`
8. `SETUP_GUIDE.md`
9. `FILE_STRUCTURE.md`
10. (This file)

---

## ✅ Setup Checklist

- [x] File structure created
- [x] Routes organized
- [x] Services implemented
- [x] Middleware configured
- [x] Types defined
- [x] Documentation written
- [ ] Dependencies installed (`npm install`)
- [ ] Gemini API key added to `.env`
- [ ] Database migrated (`npm run prisma`)
- [ ] Server tested (`npm run dev`)

---

## 🚀 Next Steps

1. **Install new dependencies:**
   ```bash
   npm install
   ```

2. **Add Gemini API key to `.env`:**
   ```env
   GEMINI_API_KEY="your-key-here"
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test endpoints:**
   - Check `SETUP_GUIDE.md` for test commands
   - Review `API_DOCUMENTATION.md` for full API specs

---

**All files created successfully! 🎉**
