// Client-side data processing utilities

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
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
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^(v|ver|version)\s*/i, '');
  
  return cleaned;
}

/**
 * Standardize and validate date format (YYYY-MM-DD)
 */
function normalizeDate(dateStr) {
  if (!dateStr) return '';
  
  const cleaned = cleanText(dateStr);
  
  try {
    const date = new Date(cleaned);
    if (!Number.isNaN(date.getTime())) {
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
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
  
  // Remove currency symbols and commas
  const cleaned = String(cost).replace(/[$,€£¥]/g, '').trim();
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


