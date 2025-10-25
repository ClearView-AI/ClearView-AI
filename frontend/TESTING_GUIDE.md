# 🧪 ClearView AI - Testing Guide

## Prerequisites

- Frontend running on `http://localhost:5173`
- Backend running on `http://localhost:3000`

---

## 🎯 Manual Testing Checklist

### 1. **Visual Testing** (No Backend Required)

Open http://localhost:5173 and verify:

#### Sidebar
- [ ] Logo displays with blue gradient
- [ ] Navigation items are visible
- [ ] "Dashboard" item is highlighted (blue background)
- [ ] Hover over nav items shows hover state
- [ ] Folder section expands/collapses

#### Top Toolbar
- [ ] Breadcrumb shows "Dashboard / Analytics"
- [ ] Icons display correctly

#### Upload Panel (Left Column)
- [ ] Dropzone with dashed border visible
- [ ] Upload icon (blue) displays
- [ ] "Drag & drop" text visible
- [ ] "Download sample file" link present
- [ ] Two buttons: "Normalize Data" and "Compute EOS"

#### KPI Cards (Right Column - 4 Cards)
- [ ] Card 1: Total Software Assets (1,247, +12.5% green)
- [ ] Card 2: Critical Vulnerabilities (23, -8.3% red)
- [ ] Card 3: Compliance Rate (94.2%, +2.1% green)
- [ ] Card 4: Monthly Spend ($47,832, +5.7% green)
- [ ] Icons display in top-right of each card
- [ ] Hover over cards shows subtle background change

#### Charts Section
- [ ] **Bar Chart** (Left): "Software by Manufacturer"
  - [ ] 7 bars for different manufacturers
  - [ ] Microsoft bar is tallest (~340)
  - [ ] Blue color (#3B82F6)
  - [ ] Labels visible at bottom
  
- [ ] **Donut Chart** (Right): "Risk Categories"
  - [ ] 3 segments: Green (Safe), Yellow (Warning), Red (Critical)
  - [ ] Legend on right side with values
  - [ ] Safe: 1157, Warning: 67, Critical: 23

#### Data Table (Bottom)
- [ ] Title: "Software Inventory"
- [ ] Search box on top-right
- [ ] Export button on top-right
- [ ] 5 sample records displayed
- [ ] Columns: Vendor, Product, Version, EOS Date, Risk Level, License Cost
- [ ] Risk badges colored correctly (red, yellow, green)
- [ ] Click column headers to sort (arrows appear)

---

## 🔌 Testing with Backend (API Integration)

### Setup Environment

1. Check your `.env` file:
```bash
cat .env
```

Should show:
```
VITE_API_URL=http://localhost:3000
```

2. Verify backend is running:
```bash
curl http://localhost:3000/api/summary
```

### Test Scenarios

#### **Test 1: File Upload**

1. Prepare test CSV (use `sample-data.csv`):
```csv
Vendor,Product,Version,EOS Date,Risk,Cost
Microsoft,Windows Server,2012 R2,2023-10-10,Critical,15000
Adobe,Creative Cloud,2023,2026-12-31,Safe,8500
```

2. In the browser:
   - Click or drag CSV file to upload zone
   - File name should appear below dropzone
   - Check browser console (F12) for API call

3. Expected API call:
```
POST http://localhost:3000/api/ingest
Content-Type: multipart/form-data
```

4. Check Network tab for response

#### **Test 2: Normalize Data**

1. After uploading file, click "Normalize Data" button
2. Button should show "Processing..." during request
3. Toast notification should appear (success or error)

Expected API call:
```
POST http://localhost:3000/api/normalize
```

#### **Test 3: Compute EOS**

1. Click "Compute EOS" button
2. Watch for toast notification
3. Check console for API response

Expected API call:
```
POST http://localhost:3000/api/eos
```

#### **Test 4: Export Data**

1. Click "Export" button in table header
2. CSV file should download automatically
3. Check downloaded file contents

Expected API call:
```
GET http://localhost:3000/api/export
```

---

## 🛠️ Testing with Browser DevTools

### Open Developer Console (F12)

1. **Console Tab** - Check for:
   - No errors in red
   - API call logs
   - Any warnings

2. **Network Tab** - Monitor:
   - API requests
   - Response status (200 = success, 404 = not found, 500 = server error)
   - Response payload
   - Request headers

3. **Elements Tab** - Inspect:
   - Component structure
   - Applied CSS classes
   - Tailwind styles

---

## 🧪 Testing Axios Directly

### Using Browser Console

Open DevTools Console and run:

```javascript
// Test Summary endpoint
fetch('http://localhost:3000/api/summary')
  .then(r => r.json())
  .then(data => console.log('Summary:', data))
  .catch(err => console.error('Error:', err));

// Test Records endpoint
fetch('http://localhost:3000/api/records')
  .then(r => r.json())
  .then(data => console.log('Records:', data))
  .catch(err => console.error('Error:', err));
```

### Using cURL Commands

```bash
# Test summary endpoint
curl -X GET http://localhost:3000/api/summary

# Test file upload
curl -X POST http://localhost:3000/api/ingest \
  -F "file=@sample-data.csv"

# Test normalize
curl -X POST http://localhost:3000/api/normalize

# Test EOS computation
curl -X POST http://localhost:3000/api/eos

# Test Gemini extraction
curl -X POST http://localhost:3000/api/gemini/extract-software \
  -H "Content-Type: application/json" \
  -d '{"text": "Microsoft Office 365 Version 2021"}'
```

---

## 🎭 Interactive Testing

### Test User Flow (Full Cycle)

1. **Start Fresh**
   - Refresh browser (Cmd/Ctrl + R)
   - Open DevTools Console

2. **Upload File**
   - Drag sample-data.csv to upload zone
   - Verify file name appears
   - Check console for success

3. **Normalize**
   - Click "Normalize Data"
   - Wait for toast notification
   - Check if KPIs update (if backend supports)

4. **Compute EOS**
   - Click "Compute EOS"
   - Wait for completion
   - Check table for updated data

5. **Search & Filter**
   - Type "Microsoft" in search box
   - Verify table filters results
   - Clear search to see all records

6. **Sort Table**
   - Click "Vendor" column header
   - Verify ascending sort (A→Z)
   - Click again for descending (Z→A)

7. **Export**
   - Click "Export" button
   - Verify CSV downloads
   - Open CSV to check data

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Error:** "Access-Control-Allow-Origin"
**Solution:** Backend needs to enable CORS:
```javascript
app.use(cors({ origin: 'http://localhost:5173' }));
```

### Issue: Network Error
**Error:** "Network Error" or "ERR_CONNECTION_REFUSED"
**Solution:** 
1. Check if backend is running
2. Verify `VITE_API_URL` in `.env`
3. Try: `curl http://localhost:3000/api/summary`

### Issue: 404 Not Found
**Error:** "Request failed with status code 404"
**Solution:** Endpoint not implemented in backend yet

### Issue: File Upload Fails
**Error:** "Unexpected end of JSON input"
**Solution:** 
1. Backend expecting different format
2. Check backend logs
3. Verify CSV format

---

## ✅ Success Indicators

**Frontend is working correctly when:**
- [ ] All components render without errors
- [ ] Console shows no red errors
- [ ] Charts display data
- [ ] Table is sortable and searchable
- [ ] Buttons respond to clicks
- [ ] Hover effects work smoothly

**API integration is working when:**
- [ ] Network tab shows 200 status codes
- [ ] Toast notifications appear on actions
- [ ] Data updates after API calls
- [ ] File uploads successfully
- [ ] Export downloads CSV

---

## 🎯 Performance Testing

Check in DevTools:

1. **Lighthouse Audit** (DevTools → Lighthouse)
   - Performance score
   - Accessibility score
   - Best practices

2. **Load Time**
   - Should load in < 2 seconds
   - Check Network tab "Finish" time

3. **Bundle Size**
   - JavaScript: ~150KB (gzipped)
   - CSS: ~4KB (gzipped)

---

## 📊 Expected Results

### Default Data (No Backend)

- **Total Software Assets:** 1,247
- **Critical Vulnerabilities:** 23
- **Compliance Rate:** 94.2%
- **Monthly Spend:** $47,832
- **Table Records:** 5 sample entries
- **Manufacturers:** Microsoft, Adobe, Oracle, Salesforce, SAP, VMware, Atlassian

### With Backend

Data should update based on:
- Uploaded CSV files
- AI normalization results
- EOS computation results

---

## 🚀 Quick Test Script

Run all tests in sequence:

```bash
# 1. Check frontend
curl -s http://localhost:5173 | grep "ClearView"

# 2. Check backend
curl -s http://localhost:3000/api/summary

# 3. Test file upload (if backend ready)
curl -X POST http://localhost:3000/api/ingest \
  -F "file=@sample-data.csv" | jq

# 4. Test normalize
curl -X POST http://localhost:3000/api/normalize | jq

# 5. Test EOS
curl -X POST http://localhost:3000/api/eos | jq
```

---

## 📝 Test Results Template

Use this to document your tests:

```
## Test Session: [Date]

### Environment
- Frontend: ✅ Running on :5173
- Backend: ✅ Running on :3000

### Component Tests
- Sidebar: ✅ Pass
- Upload Panel: ✅ Pass
- KPI Cards: ✅ Pass
- Charts: ✅ Pass
- Table: ✅ Pass

### API Tests
- Upload: ✅ 200 OK
- Normalize: ✅ 200 OK
- Compute EOS: ✅ 200 OK
- Export: ✅ File downloaded

### Issues Found
- None / [List issues]

### Notes
- [Any observations]
```

---

Need help debugging? Check:
1. Browser console for errors
2. Network tab for failed requests
3. Backend logs for API errors
4. `README.md` for setup instructions

