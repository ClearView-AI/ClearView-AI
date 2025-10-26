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
 * Normalize data: standardize field names and clean values
 */
export function normalizeData(rawData) {
  return rawData.map(row => ({
    vendor: row.Vendor || row.vendor || row.Manufacturer || '',
    product: row.Product || row.product || '',
    version: row.Version || row.version || '',
    eosDate: row['EOS Date'] || row.eosDate || row['End of Support'] || '',
    risk: row.Risk || row.risk || 'Unknown',
    cost: parseFloat(row.Cost || row.cost || '0') || 0
  }));
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
        if (!isNaN(eosDate.getTime())) {
          daysUntilEOS = Math.floor((eosDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilEOS < 0) {
            riskScore = 'Critical';
            eosStatus = 'Past EOS';
          } else if (daysUntilEOS < 365) {
            riskScore = 'Warning';
            eosStatus = 'Approaching EOS';
          } else {
            riskScore = 'Safe';
            eosStatus = 'Active Support';
          }
        }
      } catch (e) {
        // Invalid date, keep defaults
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


