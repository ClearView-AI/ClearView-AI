import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { UploadPanel } from './components/UploadPanel';
import { KPIs } from './components/KPIs';
import { RiskCharts } from './components/RiskCharts';
import { RecordsTable } from './components/RecordsTable';
import { ToastContainer } from './components/Toast';
import { NormalizePreview } from './components/NormalizePreview';
import { useToast } from './hooks/useToast';
import { parseCSV, normalizeData, computeEOS, calculateSummary, getChartData, exportToCSV } from './lib/dataProcessor';
import { api } from './lib/api';

function App() {
  const [rawCSVText, setRawCSVText] = useState(null);
  const [csvFileId, setCsvFileId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [normalizedDataPreview, setNormalizedDataPreview] = useState(null);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [relationshipsDetected, setRelationshipsDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'normalize'
  
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
      setFileName(file.name);
      
      // Reset processed data when uploading new file
      setProcessedData(null);
      setNormalizedDataPreview(null);
      setAiEnhanced(false);
      
      success('File uploaded successfully!');
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload file';
      error(`Upload failed: ${errorMessage}`);
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    // Reset all state related to uploaded file
    setRawCSVText(null);
    setCsvFileId(null);
    setFileName('');
    setProcessedData(null);
    setNormalizedDataPreview(null);
    setAiEnhanced(false);
    setRelationshipsDetected(false);
    setCurrentView('dashboard');
    success('File cleared successfully!');
  };

  const handleNormalize = async () => {
    try {
      if (!rawCSVText) {
        error('Please upload a file first.');
        return;
      }
      
      setIsProcessing(true);
      
      // Step 1: Upload CSV to backend to get csvFileId
      let fileId = csvFileId;
      if (!fileId) {
        const previewResponse = await api.previewCSV({ csvText: rawCSVText, filename: 'upload.csv' });
        fileId = previewResponse.data.csvFileId;
        setCsvFileId(fileId);
      }
      
      // Step 2: Parse CSV on client side
      const rawData = parseCSV(rawCSVText);
      
      // Step 3: Do initial normalization with local logic
      const normalized = normalizeData(rawData);
      
      // Step 4: Enhance with Gemini API (AI-powered parsing)
      try {
        // Determine which column likely contains software/product names
        const firstRow = rawData[0] || {};
        const possibleColumns = ['Product', 'product', 'Software', 'software', 'Vendor', 'vendor'];
        const columnName = possibleColumns.find(col => Object.hasOwn(firstRow, col)) || Object.keys(firstRow)[0];
        
        if (columnName && rawData.length > 0) {
          // Call Gemini API to extract and parse software information
          const geminiResponse = await api.extractSoftware({
            csvFileId: fileId,
            columnName: columnName,
            limit: Math.min(rawData.length, 100) // Process up to 100 records
          });
          
          // Merge Gemini results with normalized data
          const geminiItems = geminiResponse.data.items || [];
          const enhanced = normalized.map((record, index) => {
            const geminiData = geminiItems[index]?.parsed;
            
            // Use Gemini data if confidence is high enough (> 0.7)
            if (geminiData && geminiData.confidence > 0.7) {
              return {
                ...record,
                vendor: geminiData.manufacturer || record.vendor,
                product: geminiData.product || record.product,
                version: geminiData.version || record.version,
                // Keep other fields from local normalization
                eosDate: record.eosDate,
                risk: record.risk,
                cost: record.cost
              };
            }
            
            return record;
          });
          
          setNormalizedDataPreview(enhanced);
          setAiEnhanced(true);
          success('Data normalized with AI successfully!');
        } else {
          // Fallback to local normalization if no suitable column found
          setNormalizedDataPreview(normalized);
          setAiEnhanced(false);
          success('Data normalized successfully!');
        }
      } catch (geminiError) {
        console.warn('Gemini API failed, using local normalization:', geminiError);
        // Fallback to local normalization if Gemini fails
        setNormalizedDataPreview(normalized);
        setAiEnhanced(false);
        success('Data normalized successfully! (AI enhancement unavailable)');
      }
      
      // Navigate to preview screen
      setCurrentView('normalize');
      
    } catch (err) {
      error('Failed to normalize data. Please try again.');
      console.error('Normalize error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComputeEOS = async () => {
    try {
      // Use normalizedDataPreview if processedData isn't available yet
      const dataToProcess = processedData || normalizedDataPreview;
      
      if (!dataToProcess) {
        error('Please normalize data first.');
        return;
      }
      
      setIsProcessing(true);
      
      // Step 1: Try to predict missing EOS dates with Gemini API
      try {
        const eosResponse = await api.predictEOS({ records: dataToProcess });
        const predictions = eosResponse.data.predictions || [];
        
        // Step 2: Merge predictions with existing data
        const enriched = dataToProcess.map((record, index) => {
          const prediction = predictions[index];
          
          // Use prediction if:
          // 1. No EOS date exists, OR
          // 2. Prediction has high confidence (>0.7) and provides a date
          const shouldUsePrediction = 
            (!record.eosDate && prediction?.predictedEosDate) ||
            (prediction?.confidence > 0.7 && prediction?.predictedEosDate);
          
          if (shouldUsePrediction) {
            return {
              ...record,
              eosDate: prediction.predictedEosDate,
              eosPredicted: true,
              eosConfidence: prediction.confidence,
              eosSource: prediction.source,
              eosReasoning: prediction.reasoning
            };
          }
          
          return {
            ...record,
            eosPredicted: false
          };
        });
        
        // Step 3: Compute risk scores based on dates
        const withEOS = computeEOS(enriched);
        setProcessedData(withEOS);
        
        success('EOS computation completed with AI predictions!');
      } catch (geminiError) {
        console.warn('Gemini EOS prediction failed, using local computation:', geminiError);
        
        // Fallback: Just compute risk scores from existing dates
        const withEOS = computeEOS(dataToProcess);
        setProcessedData(withEOS);
        
        success('EOS computation completed!');
      }
    } catch (err) {
      error('Failed to compute EOS. Please try again.');
      console.error('EOS error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDetectRelationships = async () => {
    try {
      // Use processedData if available, otherwise normalizedDataPreview
      const dataToAnalyze = processedData || normalizedDataPreview;
      
      if (!dataToAnalyze) {
        error('Please normalize data first.');
        return;
      }
      
      setIsProcessing(true);
      
      try {
        const relationshipResponse = await api.detectRelationships({ records: dataToAnalyze });
        const relationships = relationshipResponse.data.relationships || [];
        
        // Merge relationship data with existing data
        const enriched = dataToAnalyze.map((record, index) => {
          const relationship = relationships[index];
          
          if (relationship && relationship.confidence > 0.7) {
            return {
              ...record,
              isParent: relationship.isParent,
              isChild: relationship.isChild,
              parentProduct: relationship.parentProduct,
              parentVendor: relationship.parentVendor,
              childProducts: relationship.childProducts,
              relationshipConfidence: relationship.confidence,
              relationshipReasoning: relationship.reasoning
            };
          }
          
          return {
            ...record,
            isParent: false,
            isChild: false,
            parentProduct: null,
            parentVendor: null,
            childProducts: [],
            relationshipConfidence: 0,
            relationshipReasoning: null
          };
        });
        
        // Update the appropriate state
        if (processedData) {
          setProcessedData(enriched);
        } else {
          setNormalizedDataPreview(enriched);
        }
        
        setRelationshipsDetected(true);
        success('Product relationships detected successfully!');
      } catch (geminiError) {
        console.warn('Gemini relationship detection failed:', geminiError);
        error('Failed to detect relationships. Please try again.');
      }
    } catch (err) {
      error('Failed to detect relationships. Please try again.');
      console.error('Relationship detection error:', err);
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

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    // Keep the normalized data available for Compute EOS
  };

  const handleNormalizedDownload = () => {
    success('Normalized data downloaded successfully!');
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

  // Format data for table (map riskScore to risk for display, preserve all AI fields)
  const tableData = processedData ? processedData.map(record => ({
    ...record,
    risk: record.riskScore || record.risk
  })) : null;

  // Render normalize preview or dashboard
  if (currentView === 'normalize' && normalizedDataPreview) {
    return (
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Normalize Preview */}
        <NormalizePreview
          normalizedData={normalizedDataPreview}
          aiEnhanced={aiEnhanced}
          onBack={handleBackToDashboard}
          onDownload={handleNormalizedDownload}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

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
              onDetectRelationships={handleDetectRelationships}
              onClear={handleClear}
              loading={loading}
              fileName={fileName}
              hasNormalizedData={!!normalizedDataPreview}
              relationshipsDetected={relationshipsDetected}
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
