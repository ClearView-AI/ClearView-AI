import { useState } from 'react';
import { Search, Download, ChevronUp, ChevronDown, Sparkles, Box, Component } from 'lucide-react';
import { formatDate, getRiskBadgeClass } from '../lib/utils';

/* eslint-disable react/prop-types */
export function RecordsTable({ data, onExport }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('vendor');
  const [sortDirection, setSortDirection] = useState('asc');

  const defaultData = [
    {
      vendor: 'Microsoft',
      product: 'Windows Server',
      version: '2012 R2',
      eosDate: '2023-10-10',
      risk: 'Critical',
      cost: 15000,
    },
    {
      vendor: 'Adobe',
      product: 'Creative Cloud',
      version: '2023',
      eosDate: '2026-12-31',
      risk: 'Safe',
      cost: 8500,
    },
    {
      vendor: 'Oracle',
      product: 'Database',
      version: '11g',
      eosDate: '2024-01-31',
      risk: 'Warning',
      cost: 25000,
    },
    {
      vendor: 'Salesforce',
      product: 'CRM',
      version: 'Enterprise',
      eosDate: '2027-06-15',
      risk: 'Safe',
      cost: 12000,
    },
    {
      vendor: 'VMware',
      product: 'vSphere',
      version: '6.5',
      eosDate: '2022-10-15',
      risk: 'Critical',
      cost: 18000,
    },
  ];

  const records = data || defaultData;

  const filteredRecords = records.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.vendor.toLowerCase().includes(searchLower) ||
      record.product.toLowerCase().includes(searchLower) ||
      record.version.toLowerCase().includes(searchLower)
    );
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="card p-6 hover:bg-card-hover transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Software Inventory</h3>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search software..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <TableHeader
                label="Vendor"
                field="vendor"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHeader
                label="Product"
                field="product"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHeader
                label="Version"
                field="version"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHeader
                label="EOS Date"
                field="eosDate"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHeader
                label="Risk Level"
                field="risk"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
              <TableHeader
                label="License Cost"
                field="cost"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record, index) => (
              <tr
                key={index}
                className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-4 text-sm text-white font-semibold">
                  {record.vendor}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span>{record.product}</span>
                    {record.isParent && record.relationshipConfidence > 0.7 && (
                      <span 
                        className="inline-flex items-center text-xs text-purple-400" 
                        title={`Parent Product (${Math.round(record.relationshipConfidence * 100)}% confidence)\nContains: ${record.childProducts?.join(', ') || 'multiple products'}\n${record.relationshipReasoning || ''}`}
                      >
                        <Box className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {record.isChild && record.relationshipConfidence > 0.7 && (
                      <span 
                        className="inline-flex items-center text-xs text-cyan-400" 
                        title={`Child Product (${Math.round(record.relationshipConfidence * 100)}% confidence)\nPart of: ${record.parentVendor || ''} ${record.parentProduct || ''}\n${record.relationshipReasoning || ''}`}
                      >
                        <Component className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-400">
                  {record.version}
                </td>
                <td className="px-4 py-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span>{formatDate(record.eosDate)}</span>
                    {record.eosPredicted && (
                      <span 
                        className="inline-flex items-center text-xs text-blue-400" 
                        title={`AI Predicted (${Math.round(record.eosConfidence * 100)}% confidence)\n${record.eosReasoning || ''}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={getRiskBadgeClass(record.risk)}>
                    {record.risk}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-white font-medium">
                  ${record.cost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TableHeader({ label, field, sortField, sortDirection, onSort }) {
  const isActive = sortField === field;

  return (
    <th
      className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {isActive && (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-4 h-4 text-white" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white" />
          )
        )}
      </div>
    </th>
  );
}

