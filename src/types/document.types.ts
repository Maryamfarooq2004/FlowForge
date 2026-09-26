// Frontend mirror of the backend Document DTO (server/src/models/Document.model.ts).

export type DocumentType = 'excel' | 'csv' | 'pdf';
export type DocumentStatus = 'parsed' | 'failed' | 'merged';

export interface DocSheet {
  name: string;
  columns: string[];
  rowCount: number;
  sampleRows: Record<string, any>[];
}

export interface DocDetected {
  roles: string[];
  fields: string[];
  rules: string[];
}

export interface DocExtraction {
  kind?: 'sheets' | 'text';
  sheets?: DocSheet[];
  text?: string;
  snippet?: string;
  pageCount?: number;
}

export interface DocumentDTO {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: DocumentType;
  status: DocumentStatus;
  extraction: DocExtraction;
  detected: DocDetected;
  error?: string;
  createdAt: string;
}

export interface DocumentItems {
  roles: string[];
  fields: string[];
  rules: string[];
}
