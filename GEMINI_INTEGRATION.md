# Gemini AI Integration Guide

## Overview

The ClearView AI frontend now integrates Google's Gemini API to enhance data normalization with AI-powered parsing. This provides intelligent extraction and standardization of software information.

## Architecture

### Hybrid Approach
The implementation uses a **hybrid normalization strategy**:

1. **Local Normalization (Baseline)** - Always runs first
   - Parses CSV client-side
   - Cleans whitespace, standardizes vendor names
   - Normalizes dates, versions, risks, and costs
   - Fast, reliable, works offline

2. **AI Enhancement (Gemini API)** - Runs as enhancement layer
   - Uploads CSV to backend to obtain `csvFileId`
   - Calls `/api/gemini/extract-software` endpoint
   - Parses software names into structured data:
     - `manufacturer` (vendor)
     - `product` name
     - `edition` (e.g., "Enterprise", "Professional")
     - `version` number
     - `confidence` score (0-1)
   - Merges AI results with local normalization
   - Falls back gracefully if API fails

### Flow Diagram

```
User clicks "Normalize Data"
         ↓
Parse CSV locally
         ↓
Apply local normalization
         ↓
Upload CSV to backend → Get csvFileId
         ↓
Call Gemini API with csvFileId
         ↓
Receive AI-parsed data
         ↓
Merge AI results (confidence > 0.7) with local data
         ↓
Display enhanced normalized data
```

## Implementation Details

### Frontend Changes

#### 1. API Configuration (`src/lib/api.js`)
- Updated base URL to `http://localhost:5050` (backend port)
- Already includes `extractSoftware` endpoint

#### 2. Main App (`src/App.jsx`)
- Added `csvFileId` state to track backend file ID
- Added `aiEnhanced` state to track if Gemini was used
- Updated `handleNormalize()`:
  - Uploads CSV to backend via `api.previewCSV()`
  - Calls local normalization first
  - Attempts Gemini API enhancement
  - Merges results with confidence threshold (0.7)
  - Falls back to local normalization on error
  - Sets `aiEnhanced` flag for UI feedback

#### 3. Normalize Preview (`src/components/NormalizePreview.jsx`)
- Added `aiEnhanced` prop
- Added sparkle icon (✨) badge when AI is used
- Shows "AI Enhanced" indicator in header
- Updates subtitle to mention "Enhanced with Gemini AI"

## Backend Integration

### Required Endpoint: `/api/gemini/extract-software`

**Request:**
```json
{
  "csvFileId": "abc123",
  "columnName": "Product",
  "limit": 100
}
```

**Response:**
```json
{
  "items": [
    {
      "raw": "Microsoft Windows Server v2012 R2",
      "parsed": {
        "manufacturer": "Microsoft",
        "product": "Windows Server",
        "edition": null,
        "version": "2012 R2",
        "confidence": 0.95
      }
    }
  ],
  "cached": false
}
```

### Backend Requirements

1. **CSV Storage**: CSV text must be stored in `CSV_STORE` by `csvFileId`
2. **Gemini API Key**: Set `GEMINI_API_KEY` in `.env`
3. **Caching**: Backend implements 10-minute cache for Gemini responses
4. **Error Handling**: Returns proper error messages if API key is missing

## Configuration

### Environment Variables

**Backend (`.env`):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5050
```

**Frontend (`.env`):**
```env
VITE_API_URL=http://localhost:5050
```

## Usage Flow

1. **Upload CSV File**
   - User uploads CSV via drag-and-drop or file picker
   - File is read and stored in frontend state

2. **Click "Normalize the Data"**
   - CSV is uploaded to backend (stored in session)
   - Local normalization runs immediately
   - Gemini API is called in background
   - Results are merged intelligently
   - User sees "Data normalized with AI successfully!" toast

3. **View Normalized Data**
   - Preview screen shows cleaned data
   - "AI Enhanced" badge appears if Gemini was used
   - Download cleaned CSV

## Features

### Confidence-Based Merging
- Only uses Gemini results with confidence > 0.7
- Lower confidence defaults to local normalization
- Ensures data quality and accuracy

### Graceful Degradation
- If Gemini API fails (no API key, rate limit, etc.)
- System falls back to local normalization
- User sees: "Data normalized successfully! (AI enhancement unavailable)"
- Application continues to work offline

### Column Detection
- Automatically detects product/software column
- Tries common column names: `Product`, `Software`, `Vendor`
- Falls back to first column if none found

### Visual Feedback
- ✨ Sparkles icon indicates AI enhancement
- Badge shows "AI Enhanced" status
- Toast notifications explain what happened
- Subtitle mentions Gemini AI when used

## Benefits

### For Users
- **Better Data Quality**: AI understands complex software naming
- **Smarter Parsing**: Handles vendor abbreviations, versions, editions
- **Transparency**: Clear indication when AI is used
- **Reliability**: Always works even if AI is unavailable

### For Developers
- **Modular Design**: Easy to enable/disable AI layer
- **Testable**: Local normalization can be tested independently
- **Maintainable**: Clear separation of concerns
- **Extensible**: Easy to add more AI features

## Testing

### Test Cases

1. **Happy Path (AI Success)**
   - Upload messy CSV
   - Click normalize
   - Verify AI Enhanced badge appears
   - Check data quality

2. **Fallback (AI Unavailable)**
   - Stop backend or remove API key
   - Upload CSV and normalize
   - Verify local normalization still works
   - Check toast message mentions unavailable AI

3. **Mixed Confidence**
   - Upload data with varying quality
   - Some records get AI enhancement (high confidence)
   - Others use local normalization (low confidence)
   - Verify intelligent merging

### Sample Data Test
Use `messy-sample-data.csv` which contains:
- Inconsistent vendor capitalization
- Mixed date formats
- Various version prefixes ("v", "ver", "version")
- Different currency symbols
- Risk levels in different cases

## Performance

- **Local Normalization**: ~50ms for 100 records
- **API Upload**: ~100-200ms
- **Gemini API Call**: ~2-5 seconds (cached: ~50ms)
- **Total**: ~2-5 seconds for first run, much faster when cached

## Error Handling

### Frontend Errors
- Missing file → Toast error
- Upload failed → Toast error
- Normalization failed → Toast error + console log
- Gemini timeout → Fallback to local, toast warning

### Backend Errors
- No API key → Returns error, frontend falls back
- Rate limit → Returns error, frontend falls back
- Invalid CSV → Returns error message
- Timeout → Frontend falls back after 20 seconds

## Future Enhancements

1. **Progressive Enhancement**
   - Show local results immediately
   - Update with AI results when ready

2. **Batch Processing**
   - Process large files in chunks
   - Show progress indicator

3. **User Preferences**
   - Toggle AI enhancement on/off
   - Adjust confidence threshold

4. **AI Training**
   - Learn from user corrections
   - Improve accuracy over time

## Troubleshooting

### AI Badge Not Appearing
- Check backend is running on port 5050
- Verify `GEMINI_API_KEY` is set in backend `.env`
- Check browser console for errors
- Verify Gemini API quota is available

### Slow Normalization
- First call takes 2-5 seconds (Gemini API)
- Subsequent calls are cached (< 1 second)
- Clear cache via `/api/gemini/clear-cache` if needed

### Data Not Improving
- Check Gemini confidence scores in console
- Low confidence means local normalization is used
- Review column detection logic
- Ensure data has recognizable software names

## API Rate Limits

Google Gemini API has rate limits:
- **Free Tier**: 60 requests per minute
- **Paid Tier**: Higher limits available

Backend implements caching to minimize API calls.

## Security Notes

- API key is stored in backend only (never exposed to frontend)
- CSV data is stored in memory (not persisted)
- CORS is configured for local development
- Production deployment should use environment variables

## Conclusion

The Gemini AI integration enhances ClearView's data normalization capabilities while maintaining reliability through graceful fallbacks. The hybrid approach ensures users always get clean data, with AI enhancement when available.

