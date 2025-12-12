/**
 * @summary
 * Domain types for image upload functionality.
 * Defines the core data structures for the image upload domain.
 *
 * @module domain/imageUpload/types/models
 */

export type UploadStatus = 'aguardando' | 'processando' | 'concluído' | 'erro';

export type SessionStatus = 'nova' | 'em_andamento' | 'concluida' | 'erro';

export interface ImageUpload {
  sessionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: UploadStatus;
  uploadedAt: string;
}

export interface ImageUploadSession {
  sessionId: string;
  status: SessionStatus;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
