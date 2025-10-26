// Client-side data processing utilities

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    for (const [index, header] of headers.entries()) {
      row[header] = values[index] || '';
    }
    if (Object.values(row).some(v => v !== '')) {
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Clean and trim text, remove extra whitespace
 */
function cleanText(text) {
  if (!text) return '';
  return String(text).trim().replace(/\s+/g, ' ');
}

/**
 * Standardize vendor names (capitalize properly)
 */
function normalizeVendor(vendor) {
  if (!vendor) return '';
  const cleaned = cleanText(vendor);
  
  // Common vendor name mappings
  const vendorMap = {
    'microsoft': 'Microsoft',
    'adobe': 'Adobe',
    'oracle': 'Oracle',
    'salesforce': 'Salesforce',
    'vmware': 'VMware',
    'sap': 'SAP',
    'atlassian': 'Atlassian',
    'google': 'Google',
    'amazon': 'Amazon',
    'ibm': 'IBM',
    'cisco': 'Cisco',
    'hp': 'HP',
    'dell': 'Dell'
  };
  
  const lowerVendor = cleaned.toLowerCase();
  return vendorMap[lowerVendor] || 
         cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Standardize product names
 */
function normalizeProduct(product) {
  if (!product) return '';
  return cleanText(product);
}

/**
 * Clean and standardize version numbers
 */
function normalizeVersion(version) {
  if (!version) return '';
  let cleaned = cleanText(version);
  
  // Remove common prefixes (whole word only)
  cleaned = cleaned.replace(/^v\s+/i, ''); // "v 2.0" → "2.0"
  cleaned = cleaned.replace(/^v(\d)/i, '$1'); // "v2.0" → "2.0"
  cleaned = cleaned.replace(/^ver\s+/i, ''); // "ver 2.0" → "2.0"
  cleaned = cleaned.replace(/^version\s+/i, ''); // "version 2.0" → "2.0"
  
  return cleaned;
}

/**
 * Standardize and validate date format (YYYY-MM-DD)
 */
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  
  const cleaned = cleanText(dateStr);
  
  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Try to parse different date formats
  let year, month, day;
  
  // Format: MM/DD/YYYY or M/D/YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    month = slashMatch[1].padStart(2, '0');
    day = slashMatch[2].padStart(2, '0');
    year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Format: MM-DD-YYYY or M-D-YYYY
  const dashMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    month = dashMatch[1].padStart(2, '0');
    day = dashMatch[2].padStart(2, '0');
    year = dashMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Format: YYYY/MM/DD
  const yearFirstSlash = cleaned.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (yearFirstSlash) {
    year = yearFirstSlash[1];
    month = yearFirstSlash[2].padStart(2, '0');
    day = yearFirstSlash[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  try {
    // Last resort: try JavaScript Date parsing
    const date = new Date(cleaned + 'T00:00:00Z');
    if (!Number.isNaN(date.getTime())) {
      year = date.getUTCFullYear();
      month = String(date.getUTCMonth() + 1).padStart(2, '0');
      day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.warn('Invalid date format:', cleaned, e);
  }
  
  return cleaned;
}

/**
 * Standardize risk levels
 */
function normalizeRisk(risk) {
  if (!risk) return 'Unknown';
  
  const cleaned = cleanText(risk).toLowerCase();
  
  if (cleaned.includes('critical') || cleaned.includes('high')) {
    return 'Critical';
  } else if (cleaned.includes('warning') || cleaned.includes('medium') || cleaned.includes('moderate')) {
    return 'Warning';
  } else if (cleaned.includes('safe') || cleaned.includes('low') || cleaned.includes('good')) {
    return 'Safe';
  }
  
  return 'Unknown';
}

/**
 * Normalize cost values
 */
function normalizeCost(cost) {
  if (!cost) return 0;
  
  // Remove currency symbols, commas, and whitespace
  let cleaned = String(cost).trim();
  cleaned = cleaned.replace(/[$€£¥¢]/g, ''); // Remove currency symbols
  cleaned = cleaned.replace(/,/g, ''); // Remove thousand separators
  cleaned = cleaned.trim();
  
  const parsed = Number.parseFloat(cleaned);
  
  return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * Normalize data: standardize field names and clean values
 */
export function normalizeData(rawData) {
  if (!rawData || rawData.length === 0) return [];
  
  return rawData.map(row => {
    // Extract raw values from different possible column names
    const rawVendor = row.Vendor || row.vendor || row.Manufacturer || row.manufacturer || '';
    const rawProduct = row.Product || row.product || row.Software || row.software || '';
    const rawVersion = row.Version || row.version || row.Ver || row.ver || '';
    const rawEosDate = row['EOS Date'] || row.eosDate || row['End of Support'] || row.endOfSupport || row.EOL || '';
    const rawRisk = row.Risk || row.risk || row['Risk Level'] || row.riskLevel || '';
    const rawCost = row.Cost || row.cost || row.Price || row.price || '0';
    
    return {
      vendor: normalizeVendor(rawVendor),
      product: normalizeProduct(rawProduct),
      version: normalizeVersion(rawVersion),
      eosDate: normalizeDate(rawEosDate),
      risk: normalizeRisk(rawRisk),
      cost: normalizeCost(rawCost)
    };
  }).filter(row => {
    // Filter out rows that have no meaningful data
    return row.vendor || row.product || row.version;
  });
}

/**
 * Compute EOS (End of Support) metrics and risk scores
 */
export function computeEOS(normalizedData) {
  const today = new Date();
  
  return normalizedData.map(record => {
    let riskScore = 'Safe';
    let daysUntilEOS = Infinity;
    let eosStatus = 'Active Support';

    if (record.eosDate) {
      try {
        const eosDate = new Date(record.eosDate);
        if (!Number.isNaN(eosDate.getTime())) {
          daysUntilEOS = Math.floor((eosDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilEOS < 0) {
            riskScore = 'Critical';
            eosStatus = 'Past EOS';
          } else if (daysUntilEOS < 365) {
            riskScore = 'Warning';
            eosStatus = 'Approaching EOS';
          }
          // If >= 365 days, keep defaults (Safe, Active Support)
        }
      } catch (e) {
        console.warn('Invalid EOS date:', record.eosDate, e);
      }
    }

    return {
      ...record,
      riskScore,
      daysUntilEOS: daysUntilEOS === Infinity ? null : daysUntilEOS,
      eosStatus
    };
  });
}

/**
 * Calculate summary statistics
 */
export function calculateSummary(processedData) {
  if (!processedData || processedData.length === 0) {
    return {
      totalAssets: 0,
      criticalVulnerabilities: 0,
      complianceRate: 0,
      monthlySpend: 0
    };
  }

  const totalAssets = processedData.length;
  const criticalVulnerabilities = processedData.filter(r => r.riskScore === 'Critical').length;
  const safeAssets = processedData.filter(r => r.riskScore === 'Safe').length;
  const totalSpend = processedData.reduce((sum, r) => sum + (r.cost || 0), 0);
  const complianceRate = totalAssets > 0 ? (safeAssets / totalAssets) * 100 : 0;

  return {
    totalAssets,
    criticalVulnerabilities,
    complianceRate: Math.round(complianceRate * 10) / 10,
    monthlySpend: Math.round(totalSpend)
  };
}

/**
 * Get chart data from processed data
 */
export function getChartData(processedData) {
  if (!processedData || processedData.length === 0) {
    return {
      byVendor: [],
      byRisk: []
    };
  }

  // Group by vendor
  const vendorCounts = {};
  processedData.forEach(r => {
    vendorCounts[r.vendor] = (vendorCounts[r.vendor] || 0) + 1;
  });

  // Group by risk
  const riskCounts = { Safe: 0, Warning: 0, Critical: 0 };
  processedData.forEach(r => {
    if (riskCounts.hasOwnProperty(r.riskScore)) {
      riskCounts[r.riskScore]++;
    }
  });

  return {
    byVendor: Object.entries(vendorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10), // Top 10 vendors
    byRisk: Object.entries(riskCounts).map(([name, count]) => ({ name, count }))
  };
}

/**
 * Convert processed data to CSV format
 */
export function exportToCSV(processedData) {
  if (!processedData || processedData.length === 0) {
    return '';
  }

  const columns = ['vendor', 'product', 'version', 'eosDate', 'riskScore', 'eosStatus', 'daysUntilEOS', 'cost'];
  const header = columns.join(',');
  
  const rows = processedData.map(record => 
    columns.map(col => {
      const value = record[col];
      return value !== null && value !== undefined ? String(value) : '';
    }).join(',')
  );

  return [header, ...rows].join('\n');
}


