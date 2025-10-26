#!/bin/bash

# Step 1: Upload CSV and get csvFileId
echo "Step 1: Uploading CSV..."
RESPONSE=$(curl -s -X POST http://localhost:5050/api/auritas/viz/preview \
  -H "Content-Type: application/json" \
  -d '{
    "csvText": "Vendor,Product,Version,EOS Date,Risk,Cost\nmicrosoft,Windows Server,v2012 R2,10/10/2023,critical,15000\nADOBE,Creative Cloud,Version 2023,12/31/2026,SAFE,8500\noracle,Database,ver 11g,01-31-2024,medium,25000",
    "filename": "test.csv"
  }')

echo "$RESPONSE" | python3 -m json.tool

# Extract csvFileId
CSV_FILE_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['csvFileId'])")
echo ""
echo "CSV File ID: $CSV_FILE_ID"
echo ""

# Step 2: Call Gemini API
echo "Step 2: Calling Gemini API..."
curl -s -X POST http://localhost:5050/api/gemini/extract-software \
  -H "Content-Type: application/json" \
  -d "{
    \"csvFileId\": \"$CSV_FILE_ID\",
    \"columnName\": \"Product\",
    \"limit\": 5
  }" | python3 -m json.tool

