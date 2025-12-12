/**
 * @summary
 * Domain types for image conversion and download functionality.
 * Defines the core data structures for the converter domain.
 *
 * @module domain/converter/types/models
 */

export interface ConversionResult {
  base64Content: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  timestamp: Date;
}

export interface DownloadStatus {
  status: 'idle' | 'preparing' | 'downloading' | 'completed' | 'error';
  message?: string;
  errorType?: 'permission_denied' | 'file_corrupted' | 'no_connection' | 'server_error' | 'other';
}
