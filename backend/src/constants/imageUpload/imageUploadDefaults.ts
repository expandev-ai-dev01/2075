/**
 * @summary
 * Default values and constants for ImageUpload functionality.
 * Provides centralized configuration for file validation and session management.
 *
 * @module constants/imageUpload/imageUploadDefaults
 */

/**
 * @interface ImageUploadLimitsType
 * @description File size and validation limits for image uploads.
 *
 * @property {number} MAX_FILE_SIZE - Maximum file size in bytes (15MB)
 * @property {number} MAX_SESSIONS - Maximum number of concurrent sessions (100)
 */
export const IMAGE_UPLOAD_LIMITS = {
  /** Maximum file size: 15MB in bytes */
  MAX_FILE_SIZE: 15 * 1024 * 1024,
  /** Maximum concurrent sessions */
  MAX_SESSIONS: 100,
} as const;

/** Type representing the IMAGE_UPLOAD_LIMITS constant */
export type ImageUploadLimitsType = typeof IMAGE_UPLOAD_LIMITS;

/**
 * @interface ImageUploadMimeTypesType
 * @description Allowed MIME types for image uploads.
 *
 * @property {string} PNG - PNG image MIME type
 * @property {string} JPEG - JPEG image MIME type
 * @property {string} JPG - JPG image MIME type (alias for JPEG)
 */
export const IMAGE_UPLOAD_MIME_TYPES = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
} as const;

/** Type representing the IMAGE_UPLOAD_MIME_TYPES constant */
export type ImageUploadMimeTypesType = typeof IMAGE_UPLOAD_MIME_TYPES;

/**
 * @interface ImageUploadStatusType
 * @description Available status values for upload sessions.
 *
 * @property {string} NEW - New session, awaiting file
 * @property {string} IN_PROGRESS - Upload in progress
 * @property {string} COMPLETED - Upload completed successfully
 * @property {string} ERROR - Upload failed with error
 */
export const IMAGE_UPLOAD_STATUS = {
  NEW: 'nova',
  IN_PROGRESS: 'em_andamento',
  COMPLETED: 'concluida',
  ERROR: 'erro',
} as const;

/** Type representing the IMAGE_UPLOAD_STATUS constant */
export type ImageUploadStatusType = typeof IMAGE_UPLOAD_STATUS;
