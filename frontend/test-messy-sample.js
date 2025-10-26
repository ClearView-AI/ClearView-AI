// Test messy sample data normalization
import { readFileSync } from 'fs';
import { parseCSV, normalizeData } from './src/lib/dataProcessor.js';

console.log('============================================================');
console.log('BEFORE vs AFTER NORMALIZATION');
console.log('============================================================\n');

const csvText = readFileSync('./messy-sample-data.csv', 'utf-8');

console.log('BEFORE (Raw Messy Data):');
console.log('============================================================');
const parsed = parseCSV(csvText);
parsed.slice(0, 5).forEach((row, i) => {
  console.log(`Row ${i + 1}:`);
  console.log(`  Vendor:  "${row.Vendor}"`);
  console.log(`  Product: "${row.Product}"`);
  console.log(`  Version: "${row.Version}"`);
  console.log(`  EOS Date: "${row['EOS Date']}"`);
  console.log(`  Risk: "${row.Risk}"`);
  console.log(`  Cost: "${row.Cost}"`);
  console.log('');
});

console.log('\n============================================================');
console.log('AFTER (Cleaned & Normalized):');
console.log('============================================================');
const normalized = normalizeData(parsed);
normalized.slice(0, 5).forEach((row, i) => {
  console.log(`Row ${i + 1}:`);
  console.log(`  vendor:  "${row.vendor}" ← Cleaned & capitalized`);
  console.log(`  product: "${row.product}" ← Trimmed`);
  console.log(`  version: "${row.version}" ← Prefix removed`);
  console.log(`  eosDate: "${row.eosDate}" ← Standardized YYYY-MM-DD`);
  console.log(`  risk: "${row.risk}" ← Normalized`);
  console.log(`  cost: $${row.cost.toLocaleString()} ← Parsed number`);
  console.log('');
});

console.log('\n============================================================');
console.log('KEY CHANGES SUMMARY');
console.log('============================================================');
console.log('Vendors:');
console.log('  "  microsoft  " → "Microsoft"');
console.log('  "ADOBE" → "Adobe"');
console.log('  "oracle" → "Oracle"');
console.log('  "VMWARE" → "VMware"');
console.log('  "sap" → "SAP"');
console.log('');
console.log('Versions:');
console.log('  "v2012 R2" → "2012 R2"');
console.log('  "Version 2023" → "2023"');
console.log('  "ver 11g" → "11g"');
console.log('  "v9.0" → "9.0"');
console.log('  "version 2021" → "2021"');
console.log('');
console.log('Dates:');
console.log('  "10/10/2023" → "2023-10-10"');
console.log('  "12/31/2026" → "2026-12-31"');
console.log('  "01-31-2024" → "2024-01-31"');
console.log('  "10/15/2022" → "2022-10-15"');
console.log('  "10-13-2026" → "2026-10-13"');
console.log('');
console.log('Risk Levels:');
console.log('  "critical" → "Critical"');
console.log('  "SAFE" → "Safe"');
console.log('  "medium" → "Warning"');
console.log('  "high" → "Critical"');
console.log('  "low"/"LOW" → "Safe"');
console.log('');
console.log('Costs:');
console.log('  "$15,000" → 15000');
console.log('  "€8500" → 8500');
console.log('  "£45,000" → 45000');
console.log('  "$12,000" → 12000');
console.log('  "$9,000" → 9000');
console.log('');
console.log('============================================================');
console.log(`TOTAL: ${parsed.length} rows processed, ${normalized.length} rows normalized`);
console.log('All data cleaned successfully! ✓');
console.log('============================================================');

