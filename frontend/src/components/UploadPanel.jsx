import { Upload, Download, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

/* eslint-disable react/prop-types */
export function UploadPanel({ onUpload, onNormalize, onComputeEOS, onClear, loading, fileName: externalFileName, hasNormalizedData }) {
  const [dragActive, setDragActive] = useState(false);
  const [internalFileName, setInternalFileName] = useState('');
  const inputRef = useRef(null);
  const dragCounter = useRef(0);
  
  // Use external fileName if provided, otherwise use internal state
  const fileName = externalFileName || internalFileName;
  
  // Sync internal state with external prop
  useEffect(() => {
    if (externalFileName) {
      setInternalFileName(externalFileName);
    }
  }, [externalFileName]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['.csv', '.json', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert(`Invalid file type. Please upload a CSV, JSON, or TXT file.`);
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    setInternalFileName(file.name);
    onUpload(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInternalFileName('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="card p-6 space-y-6 hover:bg-card-hover transition-colors duration-200">
      {/* Upload Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer',
          dragActive
            ? 'border-white/30 bg-white/5 scale-[1.02]'
            : 'border-border-subtle hover:border-white/20 hover:bg-white/[0.02]',
          loading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv,.json,.txt"
          onChange={handleChange}
          disabled={loading}
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/10 shadow-lg">
            <Upload className="w-8 h-8 text-white/60" />
          </div>

          <div>
            <p className="text-base font-semibold text-white mb-1">
              Drag & drop CSV/JSON files here
            </p>
            <p className="text-sm text-gray-400">or click to browse</p>
          </div>

          {fileName && (
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg shadow-sm flex items-center gap-3 group">
              <p className="text-sm text-white font-medium">📄 {fileName}</p>
              <button
                onClick={handleClear}
                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/10 rounded"
                title="Remove file"
                aria-label="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <a
            href="#"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Download className="w-4 h-4" />
            Download sample file
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onNormalize}
          disabled={loading || !fileName}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          {loading ? 'Processing...' : 'Normalize Data'}
        </button>
        <button
          onClick={onComputeEOS}
          disabled={loading || (!fileName && !hasNormalizedData)}
          className="btn-success disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-success/20 hover:shadow-success/30 transition-all"
        >
          Compute EOS
        </button>
      </div>
    </div>
  );
}

