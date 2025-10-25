import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { UploadPanel } from './components/UploadPanel';
import { KPIs } from './components/KPIs';
import { RiskCharts } from './components/RiskCharts';
import { RecordsTable } from './components/RecordsTable';
import { ToastContainer } from './components/Toast';
import { useApi } from './hooks/useApi';
import { useToast } from './hooks/useToast';
import { api } from './lib/api';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const { toasts, success, error, removeToast } = useToast();
  
  const { execute: executeIngest, loading: ingestLoading } = useApi(api.ingest);
  const { execute: executeNormalize, loading: normalizeLoading } = useApi(api.normalize);
  const { execute: executeEOS, loading: eosLoading } = useApi(api.computeEOS);
  const { execute: executeExport } = useApi(api.exportData);

  const loading = ingestLoading || normalizeLoading || eosLoading;

  const handleUpload = async (file) => {
    try {
      setUploadedFile(file);
      
      const formData = new FormData();
      formData.append('file', file);
      
      await executeIngest(formData);
      success('File uploaded successfully!');
    } catch (err) {
      error('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    }
  };

  const handleNormalize = async () => {
    try {
      await executeNormalize();
      success('Data normalized successfully!');
    } catch (err) {
      error('Failed to normalize data. Please try again.');
      console.error('Normalize error:', err);
    }
  };

  const handleComputeEOS = async () => {
    try {
      await executeEOS();
      success('EOS computation completed!');
    } catch (err) {
      error('Failed to compute EOS. Please try again.');
      console.error('EOS error:', err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await executeExport();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'clearview-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      success('Data exported successfully!');
    } catch (err) {
      error('Failed to export data. Please try again.');
      console.error('Export error:', err);
    }
  };

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
            <KPIs />

            {/* Charts */}
            <RiskCharts />

            {/* Data Table */}
            <RecordsTable onExport={handleExport} />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;
