/**
 * @summary
 * Type definitions for ImageUpload entity.
 *
 * @module services/imageUpload/imageUploadTypes
 */

/**
 * @interface ImageUploadSession
 * @description Represents an upload session
 */
export interface ImageUploadSession {
  sessionId: string;
  status: 'nova' | 'em_andamento' | 'concluida' | 'erro';
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  fileBuffer: Buffer | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * @interface ImageUploadCreateResponse
 * @description Response structure for successful upload
 */
export interface ImageUploadCreateResponse {
  sessionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  uploadedAt: string;
}

/**
 * @interface ImageUploadSessionResponse
 * @description Response structure for session status
 */
export interface ImageUploadSessionResponse {
  sessionId: string;
  status: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
}

/**
 * @interface ImageUploadResetResponse
 * @description Response structure for session reset
 */
export interface ImageUploadResetResponse {
  sessionId: string;
  status: string;
  message: string;
}
