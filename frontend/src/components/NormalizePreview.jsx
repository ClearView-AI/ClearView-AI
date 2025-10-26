import { Download, ArrowLeft } from 'lucide-react';

/* eslint-disable react/prop-types */
export function NormalizePreview({ normalizedData, onBack, onDownload }) {
  const handleDownload = () => {
    try {
      // Convert normalized data to CSV (without EOS fields)
      const columns = ['vendor', 'product', 'version', 'eosDate', 'risk', 'cost'];
      const header = columns.join(',');
      
      const rows = normalizedData.map(record => 
        columns.map(col => {
          const value = record[col];
          return value !== null && value !== undefined ? String(value) : '';
        }).join(',')
      );

      const csvContent = [header, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'normalized-data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      if (onDownload) {
        onDownload();
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border-subtle bg-card-hover/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-border-subtle" />
              <div>
                <h1 className="text-2xl font-bold text-white">Normalized Data Preview</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Review your cleaned and normalized data before downloading
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-gray-400">Total Records:</span>
            <span className="text-lg font-semibold text-white">{normalizedData.length}</span>
          </div>
          <div className="h-4 w-px bg-border-subtle" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-400">Columns:</span>
            <span className="text-lg font-semibold text-white">6</span>
            <span className="text-xs text-gray-500">(vendor, product, version, eosDate, risk, cost)</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle bg-white/[0.02]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    EOS Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {normalizedData.map((record, index) => {
                  // Determine risk badge styling
                  let riskClassName = 'bg-gray-500/10 text-gray-400 ring-1 ring-gray-500/20';
                  if (record.risk === 'Critical') {
                    riskClassName = 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20';
                  } else if (record.risk === 'Warning') {
                    riskClassName = 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20';
                  } else if (record.risk === 'Safe') {
                    riskClassName = 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20';
                  }

                  return (
                    <tr
                      key={`record-${index}-${record.vendor}-${record.product}`}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {record.vendor || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {record.product || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {record.version || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {record.eosDate || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${riskClassName}`}>
                          {record.risk || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        ${record.cost ? record.cost.toLocaleString() : '0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border-subtle bg-card-hover/50 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Data normalized successfully • Ready for download or further processing
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

