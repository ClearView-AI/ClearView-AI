# ClearView AI - User Guide

## Overview
ClearView AI is a software asset management tool that helps you analyze and manage your software inventory, track End of Support (EOS) dates, and identify security risks.

## How to Use

### 1. Upload Your Data
- Click on the upload area or drag and drop a CSV or JSON file
- The file should contain software inventory data with these columns:
  - `Vendor` (or `Manufacturer`): Software vendor name
  - `Product`: Product name
  - `Version`: Software version
  - `EOS Date` (or `End of Support`): End of support date (YYYY-MM-DD format)
  - `Risk`: Risk level (Safe, Warning, Critical)
  - `Cost`: License cost (numeric value)

**Sample CSV format:**
```csv
Vendor,Product,Version,EOS Date,Risk,Cost
Microsoft,Windows Server,2012 R2,2023-10-10,Critical,15000
Adobe,Creative Cloud,2023,2026-12-31,Safe,8500
```

### 2. Normalize Data
- After uploading, click the "Normalize Data" button (blue button)
- This process:
  - Standardizes field names across different formats
  - Cleans and validates data
  - Prepares data for analysis
- You'll see a success message when normalization is complete

### 3. Compute EOS Analysis
- Click the "Compute EOS" button (green button)
- This calculates:
  - Risk scores based on EOS dates
  - Days until end of support
  - Current support status (Past EOS, Approaching EOS, Active Support)
- Risk levels are automatically assigned:
  - **Critical**: Past EOS date (support has ended)
  - **Warning**: Less than 1 year until EOS
  - **Safe**: More than 1 year of support remaining

### 4. View Results

#### KPI Cards
- **Total Software Assets**: Total number of software items
- **Critical Vulnerabilities**: Count of critical risk items
- **Compliance Rate**: Percentage of software with active support
- **Monthly Spend**: Total cost of software licenses

#### Charts
- **Software by Manufacturer**: Bar chart showing distribution by vendor
- **Risk Categories**: Doughnut chart showing Safe/Warning/Critical breakdown

#### Data Table
- View all processed records in a sortable, searchable table
- Click column headers to sort
- Use the search box to filter results
- Export processed data as CSV

### 5. Export Data
- Click the "Export" button to download processed data
- The exported CSV includes all calculated fields:
  - Original data (vendor, product, version, etc.)
  - Risk scores and EOS status
  - Days until EOS

## Data Processing

All data processing happens **client-side** in your browser:
- ✅ Fast and immediate results
- ✅ Your data never leaves your computer
- ✅ No server dependencies for core functionality
- ✅ Works offline after initial load

## Sample Data

Click "Download sample file" in the upload area to get a sample CSV file you can use to test the application.

## Technical Notes

### Supported File Formats
- CSV files (.csv)
- JSON files (.json)

### Date Format
- Dates should be in YYYY-MM-DD format (e.g., 2023-10-10)
- The system also supports other standard date formats

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- No special plugins required

## Troubleshooting

### "Failed to upload file"
- Check that your file is in CSV or JSON format
- Ensure the file size is under 5MB
- Verify the file has the required columns

### "Please upload a file first"
- You need to upload a file before normalizing data
- Make sure the upload completed successfully

### "Please normalize data first"
- You must click "Normalize Data" before computing EOS
- Follow the workflow: Upload → Normalize → Compute EOS

### Charts not displaying
- Ensure you've completed all three steps (Upload, Normalize, Compute EOS)
- Check that your data includes the required fields
- Try refreshing the page

## Best Practices

1. **Prepare your data**: Ensure your CSV has clear headers matching the expected column names
2. **Check dates**: Use YYYY-MM-DD format for EOS dates
3. **Regular updates**: Re-upload and process data regularly to keep risk assessments current
4. **Export results**: Save processed data for reporting and record-keeping

## Need Help?

If you encounter any issues or have questions, please contact your system administrator.


