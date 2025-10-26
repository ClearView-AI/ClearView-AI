// Test script for data normalization
import { readFileSync } from 'fs';
import { parseCSV, normalizeData } from './src/lib/dataProcessor.js';

console.log('============================================================');
console.log('TESTING DATA NORMALIZATION');
console.log('============================================================\n');

// Read sample CSV
const csvText = readFileSync('./sample-data.csv', 'utf-8');

console.log('RAW CSV DATA:');
console.log(csvText);
console.log('\n============================================================\n');

// Parse CSV
console.log('STEP 1: Parsing CSV...');
const parsed = parseCSV(csvText);
console.log(`Parsed ${parsed.length} rows\n`);

// Show first raw row
console.log('First raw row:');
console.log(JSON.stringify(parsed[0], null, 2));
console.log('\n============================================================\n');

// Normalize data
console.log('STEP 2: Normalizing data...');
const normalized = normalizeData(parsed);
console.log(`Normalized to ${normalized.length} rows\n`);

// Show results
console.log('NORMALIZED DATA RESULTS:');
console.log('============================================================\n');

normalized.forEach((row, index) => {
  console.log(`Record ${index + 1}:`);
  console.log(`  Vendor:  "${row.vendor}"`);
  console.log(`  Product: "${row.product}"`);
  console.log(`  Version: "${row.version}"`);
  console.log(`  EOS Date: "${row.eosDate}"`);
  console.log(`  Risk:    "${row.risk}"`);
  console.log(`  Cost:    $${row.cost.toLocaleString()}`);
  console.log('');
});

console.log('============================================================');
console.log('VERIFICATION TESTS');
console.log('============================================================\n');

// Test vendor normalization
console.log('✓ Vendor Normalization Tests:');
const microsoftRows = normalized.filter(r => r.vendor === 'Microsoft');
console.log(`  - Microsoft entries: ${microsoftRows.length} (should be 2)`);
const adobeRows = normalized.filter(r => r.vendor === 'Adobe');
console.log(`  - Adobe entries: ${adobeRows.length} (should be 2)`);
const oracleRows = normalized.filter(r => r.vendor === 'Oracle');
console.log(`  - Oracle entries: ${oracleRows.length} (should be 2)`);
console.log('');

// Test date formatting
console.log('✓ Date Format Tests:');
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const validDates = normalized.filter(r => datePattern.test(r.eosDate));
console.log(`  - Dates in YYYY-MM-DD format: ${validDates.length}/${normalized.length}`);
normalized.forEach((r, i) => {
  if (r.eosDate) {
    console.log(`  - Row ${i + 1}: "${r.eosDate}" ${datePattern.test(r.eosDate) ? '✓' : '✗'}`);
  }
});
console.log('');

// Test risk levels
console.log('✓ Risk Level Tests:');
const riskLevels = { Critical: 0, Warning: 0, Safe: 0, Unknown: 0 };
normalized.forEach(r => {
  if (riskLevels.hasOwnProperty(r.risk)) {
    riskLevels[r.risk]++;
  }
});
console.log(`  - Critical: ${riskLevels.Critical} (should be 4)`);
console.log(`  - Warning: ${riskLevels.Warning} (should be 1)`);
console.log(`  - Safe: ${riskLevels.Safe} (should be 5)`);
console.log(`  - Unknown: ${riskLevels.Unknown} (should be 0)`);
console.log('');

// Test cost parsing
console.log('✓ Cost Parsing Tests:');
const costs = normalized.map(r => ({ product: r.product, cost: r.cost }));
costs.forEach(({ product, cost }) => {
  console.log(`  - ${product}: $${cost.toLocaleString()} (type: ${typeof cost})`);
});
console.log('');

// Test empty row filtering
console.log('✓ Empty Row Filtering:');
console.log(`  - Input rows: ${parsed.length}`);
console.log(`  - Output rows: ${normalized.length}`);
console.log(`  - Empty rows removed: ${parsed.length - normalized.length}`);
console.log('');

console.log('============================================================');
console.log('TEST COMPLETE!');
console.log('============================================================');


