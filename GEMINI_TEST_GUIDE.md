# Gemini API Testing Guide

## What Was Fixed

I updated the Gemini model name from `gemini-1.5-flash` (deprecated) to `gemini-2.5-flash` (current) in `backend/src/gemini.ts`.

## Prerequisites

1. Backend is running on port 5050
2. GEMINI_API_KEY is set in `backend/.env`
3. Frontend is running (optional, for UI testing)

## Step 1: Restart the Backend

The backend needs to be restarted to pick up the model name change.

```bash
cd /Users/goliveira/Developer/Projects/ClearView/ClearView-AI/backend

# Stop the current backend (if running)
# Press Ctrl+C in the terminal where it's running

# Start it again
npm run dev
```

You should see:
```
Backend running on http://localhost:5050
```

## Step 2: Test Gemini API Directly

Run this test script to verify the Gemini API is working:

```bash
cd /Users/goliveira/Developer/Projects/ClearView/ClearView-AI/backend

# Upload CSV and test Gemini in one go
bash << 'EOF'
# Step 1: Upload CSV
RESPONSE=$(curl -s -X POST http://localhost:5050/api/auritas/viz/preview \
  -H "Content-Type: application/json" \
  -d '{
    "csvText": "Vendor,Product,Version,EOS Date,Risk,Cost\nmicrosoft,Windows Server,v2012 R2,10/10/2023,critical,15000\nADOBE,Creative Cloud,Version 2023,12/31/2026,SAFE,8500\noracle,Database,ver 11g,01-31-2024,medium,25000",
    "filename": "test.csv"
  }')

CSV_FILE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['csvFileId'])" 2>/dev/null)

if [ -z "$CSV_FILE_ID" ]; then
  echo "❌ Failed to upload CSV"
  exit 1
fi

echo "✅ CSV uploaded: $CSV_FILE_ID"
echo ""

# Step 2: Call Gemini API
echo "🤖 Calling Gemini API..."
GEMINI_RESPONSE=$(curl -s -X POST http://localhost:5050/api/gemini/extract-software \
  -H "Content-Type: application/json" \
  -d "{
    \"csvFileId\": \"$CSV_FILE_ID\",
    \"columnName\": \"Product\",
    \"limit\": 5
  }")

echo "$GEMINI_RESPONSE" | python3 -m json.tool

# Check if successful
if echo "$GEMINI_RESPONSE" | grep -q '"items"'; then
  echo ""
  echo "✅ SUCCESS! Gemini API is working!"
  echo ""
  echo "Sample parsed result:"
  echo "$GEMINI_RESPONSE" | python3 -c "import sys, json; d = json.load(sys.stdin); item = d['items'][0] if d.get('items') else None; print(json.dumps(item, indent=2)) if item else print('No items')"
else
  echo ""
  echo "❌ FAILED! Check the error above"
fi
EOF
```

### Expected Output

If successful, you should see:

```json
{
  "items": [
    {
      "raw": "Windows Server",
      "parsed": {
        "manufacturer": "Microsoft",
        "product": "Windows Server",
        "edition": null,
        "version": "2012 R2",
        "confidence": 0.95
      }
    },
    {
      "raw": "Creative Cloud",
      "parsed": {
        "manufacturer": "Adobe",
        "product": "Creative Cloud",
        "edition": null,
        "version": "2023",
        "confidence": 0.92
      }
    }
  ],
  "cached": false
}
```

## Step 3: Test from Frontend UI

Once the backend is confirmed working:

1. **Start the frontend**:
```bash
cd /Users/goliveira/Developer/Projects/ClearView/ClearView-AI/frontend
npm run dev
```

2. **Open the app** in your browser (usually http://localhost:5173)

3. **Upload a CSV file**:
   - Use `messy-sample-data.csv` from the frontend directory
   - Or drag and drop any CSV with software data

4. **Click "Normalize the Data"** button

5. **Look for the ✨ AI Enhanced badge**:
   - Should appear in the preview screen header
   - Subtitle should say "Enhanced with Gemini AI"
   - Toast notification: "Data normalized with AI successfully!"

6. **Check the data quality**:
   - Vendor names should be properly capitalized
   - Product names should be clean and standardized
   - Versions should be extracted correctly

## Troubleshooting

### Backend Won't Start

**Error:** `error TS5103: Invalid value for '--ignoreDeprecations'`

**Fix:** Update `tsconfig.json` or use the dev script instead of build:
```bash
npm run dev  # Uses ts-node, no build needed
```

### Gemini API Returns 404

**Possible causes:**
1. **Invalid API Key**: Check `.env` file has valid `GEMINI_API_KEY`
2. **Wrong Model**: Should be `gemini-2.5-flash` (now fixed)
3. **API Quota**: Check your Google Cloud quota

**Test API key directly:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Say hello"}]}]}'
```

### CSV Not Found in Session

**Error:** `"CSV not found in session"`

**Cause:** CSV_STORE is in-memory and cleared on restart

**Fix:** Upload CSV and call Gemini API in the same test (like script above)

### No AI Enhanced Badge

**Possible causes:**
1. Backend not running on port 5050
2. Gemini API call failed (check browser console)
3. Confidence scores too low (< 0.7)
4. No suitable column found in CSV

**Check browser console:**
- Open DevTools (F12)
- Look for "Gemini API failed" warnings
- Check Network tab for failed requests

### Slow Response

**Normal:** First call takes 2-5 seconds (Gemini API processing)

**Subsequent calls:** Should be fast (< 1 second) due to caching

**Clear cache if needed:**
```bash
curl -X POST http://localhost:5050/api/gemini/clear-cache
```

## Verification Checklist

- [ ] Backend running on port 5050
- [ ] GEMINI_API_KEY set in `.env`
- [ ] Model name is `gemini-2.5-flash` in `gemini.ts`
- [ ] Test script returns parsed items with confidence scores
- [ ] Frontend shows ✨ "AI Enhanced" badge
- [ ] Data quality visibly improved

## What to Look For

### Good Signs ✅
- Toast: "Data normalized with AI successfully!"
- ✨ Sparkle icon and gradient badge visible
- Vendor names properly capitalized (Microsoft, Adobe, Oracle)
- Versions extracted cleanly (no "v" or "version" prefixes)
- High confidence scores (> 0.8)

### Warning Signs ⚠️
- Toast: "AI enhancement unavailable"
- No sparkle badge (using local normalization only)
- Console warnings about Gemini API
- Low confidence scores (< 0.5)

### Error Signs ❌
- Toast: "Failed to normalize data"
- Browser console errors
- Network request failures
- Backend crashes

## Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Upload CSV | ~100ms | Network latency |
| Local Normalization | ~50ms | Pure JavaScript |
| Gemini API (first call) | 2-5s | External API + AI processing |
| Gemini API (cached) | ~50ms | From memory cache |
| Total (first time) | ~3-5s | Includes all steps |
| Total (cached) | ~200ms | Much faster! |

## Example Data

**Input (messy):**
```csv
Vendor,Product,Version,EOS Date,Risk,Cost
  microsoft  ,Windows Server,v2012 R2,10/10/2023,critical,"$15,000"
ADOBE,  Creative Cloud  ,Version 2023,12/31/2026,SAFE,€8500
oracle,Database,ver 11g,01-31-2024,medium,25000.50
```

**Output (AI enhanced):**
```json
[
  {
    "vendor": "Microsoft",
    "product": "Windows Server",
    "version": "2012 R2",
    "eosDate": "2023-10-10",
    "risk": "Critical",
    "cost": 15000
  },
  {
    "vendor": "Adobe",
    "product": "Creative Cloud",
    "version": "2023",
    "eosDate": "2026-12-31",
    "risk": "Safe",
    "cost": 8500
  }
]
```

## Next Steps After Testing

1. **If working:** Push changes to GitHub
2. **If issues:** Check troubleshooting section above
3. **Performance:** Monitor API quota and costs
4. **Enhancement:** Adjust confidence threshold if needed

## API Cost Monitoring

Gemini API has usage limits:
- **Free tier:** 60 requests/minute
- **Cost:** Check Google Cloud pricing
- **Caching:** Reduces API calls significantly

Monitor usage:
- Check Google Cloud Console
- Review backend logs
- Use `/api/gemini/clear-cache` to reset

## Support

If you encounter issues:
1. Check backend console logs
2. Check browser DevTools console
3. Review `GEMINI_INTEGRATION.md` for architecture
4. Test API key with curl command above
5. Verify model name is `gemini-2.5-flash`

---

**Ready to test!** Start with Step 1 (restart backend) and work through each step. 🚀

