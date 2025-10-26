import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { UploadPanel } from './components/UploadPanel';
import { KPIs } from './components/KPIs';
import { RiskCharts } from './components/RiskCharts';
import { RecordsTable } from './components/RecordsTable';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { parseCSV, normalizeData, computeEOS, calculateSummary, getChartData, exportToCSV } from './lib/dataProcessor';

function App() {
  const [, setCsvFileId] = useState(null);
  const [rawCSVText, setRawCSVText] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toasts, success, error, removeToast } = useToast();

  const loading = isProcessing;

  const handleUpload = async (file) => {
    // Prevent multiple simultaneous uploads
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Read file as text for client-side processing
      const text = await file.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('File is empty');
      }

      setRawCSVText(text);
      
      // Generate a simple file ID for tracking
      const fileId = `csv_${Date.now()}`;
      setCsvFileId(fileId);
      
      // Reset processed data
      setProcessedData(null);
      
      success('File uploaded successfully!');
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload file';
      error(`Upload failed: ${errorMessage}`);
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNormalize = async () => {
    try {
      if (!rawCSVText) {
        error('Please upload a file first.');
        return;
      }
      
      setIsProcessing(true);
      
      // Parse CSV on client side
      const rawData = parseCSV(rawCSVText);
      
      // Normalize data
      const normalized = normalizeData(rawData);
      setProcessedData(normalized);
      
      success('Data normalized successfully!');
    } catch (err) {
      error('Failed to normalize data. Please try again.');
      console.error('Normalize error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComputeEOS = async () => {
    try {
      if (!processedData) {
        error('Please normalize data first.');
        return;
      }
      
      setIsProcessing(true);
      
      // Compute EOS on client side
      const withEOS = computeEOS(processedData);
      setProcessedData(withEOS);
      
      success('EOS computation completed!');
    } catch (err) {
      error('Failed to compute EOS. Please try again.');
      console.error('EOS error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      if (!processedData) {
        error('No data to export. Please process data first.');
        return;
      }
      
      // Convert to CSV on client side
      const csvContent = exportToCSV(processedData);
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'clearview-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      
      success('Data exported successfully!');
    } catch (err) {
      error('Failed to export data. Please try again.');
      console.error('Export error:', err);
    }
  };

  // Calculate summary and chart data from processed data
  const summary = processedData ? calculateSummary(processedData) : null;
  const chartData = processedData ? getChartData(processedData) : null;
  
  // Format data for KPIs component
  const kpisData = summary ? [
    {
      label: 'Total Software Assets',
      value: summary.totalAssets,
      change: 12.5,
      icon: 'package',
    },
    {
      label: 'Critical Vulnerabilities',
      value: summary.criticalVulnerabilities,
      change: -8.3,
      icon: 'alert',
    },
    {
      label: 'Compliance Rate',
      value: summary.complianceRate,
      change: 2.1,
      icon: 'shield',
      suffix: '%',
    },
    {
      label: 'Monthly Spend',
      value: summary.monthlySpend,
      change: 5.7,
      icon: 'dollar',
      format: 'currency',
    },
  ] : null;

  // Format data for charts
  const manufacturerData = chartData ? {
    labels: chartData.byVendor.map(v => v.name),
    datasets: [{
      data: chartData.byVendor.map(v => v.count),
      backgroundColor: '#3B82F6',
      borderRadius: 8,
      borderSkipped: false,
    }]
  } : null;

  const riskData = chartData ? {
    labels: chartData.byRisk.map(r => r.name),
    datasets: [{
      data: chartData.byRisk.map(r => r.count),
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  } : null;

  // Format data for table (map riskScore to risk for display)
  const tableData = processedData ? processedData.map(record => ({
    vendor: record.vendor,
    product: record.product,
    version: record.version,
    eosDate: record.eosDate,
    risk: record.riskScore || record.risk,
    cost: record.cost
  })) : null;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <Toolbar title="Analytics" />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Upload Panel - Full Width at Top */}
            <UploadPanel
              onUpload={handleUpload}
              onNormalize={handleNormalize}
              onComputeEOS={handleComputeEOS}
              loading={loading}
            />

            {/* KPI Cards - 4 in a row below */}
            <KPIs data={kpisData} />

            {/* Charts */}
            <RiskCharts manufacturerData={manufacturerData} riskData={riskData} />

            {/* Data Table */}
            <RecordsTable data={tableData} onExport={handleExport} />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
