// backend/src/types/api.types.ts

export interface PreviewCsvRequest {
  csvText: string;
  filename?: string;
}

export interface PreviewCsvResponse {
  batchId: string;
  csvFileId: string;
  headers: string[];
  sampleRows: Record<string, any>[];
}

export interface RenderCsvRequest {
  csvFileId: string;
  fieldMap: Record<string, { transform: any }>;
  targetScreen: string;
  filters?: Record<string, any>;
}

export interface RenderCsvResponse {
  columns: string[];
  rows: Record<string, any>[];
}

export interface ExtractSoftwareRequest {
  rawText: string;
  columnName?: string;
}

export interface ExtractSoftwareResponse {
  vendor: string;
  product: string;
  version: string;
  confidence: number;
  normalized: boolean;
}

export interface ErrorResponse {
  error: string;
  details?: any;
}
