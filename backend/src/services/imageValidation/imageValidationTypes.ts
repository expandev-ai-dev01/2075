/**
 * @summary
 * Type definitions for Image Validation functionality.
 *
 * @module services/imageValidation/imageValidationTypes
 */

/**
 * @interface ValidationResult
 * @description Result of file validation process
 *
 * @property {boolean} isValid - Whether the file passed all validations
 * @property {string|null} errorCode - Error code if validation failed
 * @property {string|null} errorMessage - Human-readable error message
 * @property {ValidationDetails} details - Detailed validation information
 */
export interface ValidationResult {
  isValid: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  details: ValidationDetails;
}

/**
 * @interface ValidationDetails
 * @description Detailed information about validation checks
 *
 * @property {boolean} sizeValid - Whether file size is within limits
 * @property {boolean} extensionValid - Whether file extension is allowed
 * @property {boolean} formatValid - Whether file format matches extension
 * @property {boolean} signatureValid - Whether file signature is valid
 * @property {boolean} integrityValid - Whether file integrity check passed
 * @property {string|null} detectedFormat - Detected file format from signature
 * @property {string|null} declaredExtension - File extension from filename
 */
export interface ValidationDetails {
  sizeValid: boolean;
  extensionValid: boolean;
  formatValid: boolean;
  signatureValid: boolean;
  integrityValid: boolean;
  detectedFormat: string | null;
  declaredExtension: string | null;
}

/**
 * @interface FileValidationInput
 * @description Input data for file validation
 *
 * @property {string} fileName - Original file name
 * @property {number} fileSize - File size in bytes
 * @property {string} mimeType - MIME type from upload
 * @property {Buffer} fileBuffer - File content buffer
 */
export interface FileValidationInput {
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileBuffer: Buffer;
}
