# ClearView Backend API Documentation

**Base URL**: `http://localhost:5052`  
**Version**: 1.0.0  
**Last Updated**: October 25, 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Auritas Visualization Endpoints](#auritas-visualization-endpoints)
   - [Gemini AI Endpoints](#gemini-ai-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Overview

ClearView Backend provides APIs for:
- **CSV Processing**: Upload, preview, transform, and export CSV data
- **AI-Powered Data Cleaning**: Gemini API integration for software inventory normalization
- **Auritas Data Visualization**: Transform messy data into structured formats

---

## Authentication

Currently, no authentication is required (hackathon mode).  
In production, implement JWT or API key authentication.

---

## Endpoints

### Health Check

#### `GET /health`
Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-25T12:00:00.000Z",
  "service": "ClearView Backend"
}
```

---

## Auritas Visualization Endpoints

### 1. Preview CSV from Raw Text

#### `POST /api/auritas/viz/preview`

Upload CSV as text and get a preview with headers and sample rows.

**Request Body:**
```json
{
  "csvText": "Name,Age,City\nJohn,30,NYC\nJane,25,LA",
  "filename": "users.csv"
}
```

**Response:**
```json
{
  "batchId": "uuid-v4",
  "csvFileId": "uuid-v4",
  "headers": ["Name", "Age", "City"],
  "sampleRows": [
    { "Name": "John", "Age": "30", "City": "NYC" },
    { "Name": "Jane", "Age": "25", "City": "LA" }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing csvText or invalid format
- `500 Internal Server Error` - Processing failed

---

### 2. Upload CSV File (Multipart)

#### `POST /api/auritas/viz/preview-file`

Upload a CSV file using multipart form data.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Accepted types: `.csv`, `text/csv`, `text/plain`
- Max size: 10MB

**Example (cURL):**
```bash
curl -X POST http://localhost:5052/api/auritas/viz/preview-file \
  -F "file=@data.csv"
```

**Example (Postman):**
1. Select POST method
2. Choose "Body" → "form-data"
3. Add key "file" (type: File)
4. Upload your CSV file

**Response:** Same as `/preview` endpoint

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - No file uploaded or invalid file type
- `500 Internal Server Error` - Processing failed

---

### 3. Transform CSV Using Field Map

#### `POST /api/auritas/viz/render`

Apply field transformations and filters to a previously uploaded CSV.

**Request Body:**
```json
{
  "csvFileId": "uuid-from-preview",
  "targetScreen": "sap_example_screen",
  "fieldMap": {
    "DocNumber": {
      "transform": { "fn": "padLeft", "args": ["Document ID", "0", 10] }
    },
    "Vendor": {
      "transform": { "fn": "identity", "args": ["Vendor Name"] }
    },
    "PostDate": {
      "transform": { "fn": "normalizeDate", "args": ["Posting Date"] }
    },
    "Amount": {
      "transform": { "fn": "number", "args": ["Total"] }
    },
    "Currency": {
      "transform": { "fn": "upper", "args": ["Currency"] }
    },
    "Status": {
      "transform": { "fn": "upper", "args": ["Status"] }
    }
  },
  "filters": {
    "Status": ["OPEN", "PENDING", "POSTED"]
  }
}
```

**Available Transform Functions:**
- `identity` - Pass through value unchanged
- `upper` - Convert to uppercase
- `lower` - Convert to lowercase
- `concat` - Concatenate multiple fields
- `number` - Parse as number
- `padLeft` - Pad string with characters
- `substring` - Extract substring
- `split` - Split string and take indexed part
- `normalizeDate` - Normalize date formats

**Response:**
```json
{
  "columns": ["DocNumber", "Vendor", "PostDate", "Amount", "Currency", "Status"],
  "rows": [
    {
      "DocNumber": "0000001234",
      "Vendor": "Acme Corp",
      "PostDate": "2025-10-25",
      "Amount": 1500.00,
      "Currency": "USD",
      "Status": "POSTED"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing required fields
- `404 Not Found` - CSV file not found in session
- `500 Internal Server Error` - Transform failed

---

### 4. Download Transformed CSV

#### `GET /api/auritas/viz/export`

Export transformed CSV file for download.

**Query Parameters:**
- `csvFileId` (required) - UUID from preview
- `targetScreen` (required) - Recipe name (e.g., "sap_example_screen")
- `fieldMapJson` (required) - JSON-stringified field map
- `filtersJson` (optional) - JSON-stringified filters

**Example:**
```bash
curl -G http://localhost:5052/api/auritas/viz/export \
  --data-urlencode "csvFileId=uuid-here" \
  --data-urlencode "targetScreen=sap_example_screen" \
  --data-urlencode 'fieldMapJson={"DocNumber":{"transform":{"fn":"identity","args":["ID"]}}}' \
  -o output.csv
```

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="auritas_sap_example_screen.csv"`
- Body: CSV file stream

**Status Codes:**
- `200 OK` - File downloaded
- `400 Bad Request` - Missing parameters
- `404 Not Found` - CSV not found
- `500 Internal Server Error` - Export failed

---

## Gemini AI Endpoints

### 1. Extract Software Information

#### `POST /api/gemini/extract-software`

Parse software vendor, product, and version from raw text using Gemini API.

**Request Body:**
```json
{
  "rawText": "Microsoft Office 365 ProPlus v16.0.12345",
  "columnName": "software"
}
```

**Response:**
```json
{
  "vendor": "Microsoft",
  "product": "Office 365 ProPlus",
  "version": "16.0.12345",
  "confidence": 0.95,
  "normalized": true,
  "columnName": "software",
  "originalText": "Microsoft Office 365 ProPlus v16.0.12345"
}
```

**Fallback Mode:**  
If Gemini API fails or is not configured, uses regex-based extraction:
```json
{
  "vendor": "Microsoft",
  "product": "Office 365 ProPlus",
  "version": "16.0.12345",
  "confidence": 0.3,
  "normalized": false
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Missing rawText
- `500 Internal Server Error` - Extraction failed

---

### 2. Batch Extract Software

#### `POST /api/gemini/extract-batch`

Extract software info from multiple entries at once.

**Request Body:**
```json
{
  "entries": [
    "Microsoft Office 365 v16.0",
    "Adobe Photoshop CC 2024",
    "Oracle Database 19c Enterprise"
  ]
}
```

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "vendor": "Microsoft",
      "product": "Office 365",
      "version": "16.0",
      "confidence": 0.95,
      "normalized": true
    },
    {
      "vendor": "Adobe",
      "product": "Photoshop CC 2024",
      "version": "2024",
      "confidence": 0.92,
      "normalized": true
    },
    {
      "vendor": "Oracle",
      "product": "Database Enterprise",
      "version": "19c",
      "confidence": 0.88,
      "normalized": true
    }
  ]
}
```

**Limits:**
- Maximum 100 entries per batch
- Each entry processed sequentially

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid entries array or exceeds limit
- `500 Internal Server Error` - Batch processing failed

---

### 3. Gemini Health Check

#### `GET /api/gemini/health`

Check if Gemini API is properly configured.

**Response:**
```json
{
  "configured": true,
  "status": "ready"
}
```

Or if not configured:
```json
{
  "configured": false,
  "status": "missing API key"
}
```

---

## Data Models

### Transform Specification

```typescript
type TransformSpec =
  | { fn: "identity"; args: [string] }
  | { fn: "upper"; args: [string] }
  | { fn: "lower"; args: [string] }
  | { fn: "concat"; args: string[] }
  | { fn: "number"; args: [string] }
  | { fn: "padLeft"; args: [string, string, number] }
  | { fn: "substring"; args: [string, number, number] }
  | { fn: "split"; args: [string, string, number] }
  | { fn: "normalizeDate"; args: [string] };
```

### Field Map

```typescript
type FieldMap = Record<string, { transform: TransformSpec }>;
```

### Software Info

```typescript
interface SoftwareInfo {
  vendor: string;
  product: string;
  version: string;
  confidence: number;      // 0.0 to 1.0
  normalized: boolean;     // true if AI-normalized
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "details": "Optional stack trace or additional info"
}
```

### Common Error Codes

| Status | Meaning |
|--------|---------|
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error - Server-side failure |

---

## Examples

### Complete Workflow Example

#### 1. Upload CSV File
```bash
curl -X POST http://localhost:5052/api/auritas/viz/preview-file \
  -F "file=@inventory.csv"
```

**Response:**
```json
{
  "csvFileId": "abc-123-def-456",
  "batchId": "batch-789",
  "headers": ["Software", "Version", "Status"],
  "sampleRows": [...]
}
```

#### 2. Extract Software Info (Optional)
```bash
curl -X POST http://localhost:5052/api/gemini/extract-software \
  -H "Content-Type: application/json" \
  -d '{
    "rawText": "Microsoft Excel 2021"
  }'
```

#### 3. Transform CSV
```bash
curl -X POST http://localhost:5052/api/auritas/viz/render \
  -H "Content-Type: application/json" \
  -d '{
    "csvFileId": "abc-123-def-456",
    "targetScreen": "sap_example_screen",
    "fieldMap": {...},
    "filters": {"Status": ["ACTIVE"]}
  }'
```

#### 4. Export Transformed CSV
```bash
curl -G http://localhost:5052/api/auritas/viz/export \
  --data-urlencode "csvFileId=abc-123-def-456" \
  --data-urlencode "targetScreen=sap_example_screen" \
  --data-urlencode 'fieldMapJson={...}' \
  -o cleaned_output.csv
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5052

# Database
DATABASE_URL="file:./prisma/dev.db"

# Gemini API (required for AI features)
GEMINI_API_KEY="your-gemini-api-key-here"
```

---

## Testing with Postman

Import this collection URL:
```
http://localhost:5052/api/postman-collection.json
```

Or manually create requests following the examples above.

---

## Rate Limits

**Current Limits (Development):**
- No rate limits
- Max file size: 10MB
- Max batch entries: 100

**Production Recommendations:**
- Implement rate limiting (e.g., 100 requests/minute)
- Add authentication
- Monitor Gemini API usage
- Implement request queuing for batch operations

---

## Support

For issues or questions:
- **GitHub**: [ClearView Repository]
- **Team**: Zak (Backend Lead)
- **Hackathon**: BNY Mellon Challenge

---

## Changelog

### v1.0.0 (2025-10-25)
- Initial release
- Auritas CSV processing endpoints
- Gemini AI integration
- File upload support
- Complete API documentation

---

**Built with ❤️ for KnightHacks 2025**
