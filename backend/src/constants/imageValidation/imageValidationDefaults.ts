/**
 * @summary
 * Default values and constants for Image Validation functionality.
 * Provides centralized configuration for file format validation.
 *
 * @module constants/imageValidation/imageValidationDefaults
 */

/**
 * @interface ImageValidationLimitsType
 * @description File validation limits and constraints.
 *
 * @property {number} MAX_FILE_SIZE - Maximum file size in bytes (15MB)
 * @property {number} MIN_FILE_SIZE - Minimum file size in bytes (1 byte)
 * @property {number} HEADER_BYTES_TO_READ - Number of bytes to read for signature validation
 */
export const IMAGE_VALIDATION_LIMITS = {
  /** Maximum file size: 15MB in bytes */
  MAX_FILE_SIZE: 15 * 1024 * 1024,
  /** Minimum file size: 1 byte */
  MIN_FILE_SIZE: 1,
  /** Bytes to read for file signature validation */
  HEADER_BYTES_TO_READ: 12,
} as const;

/** Type representing the IMAGE_VALIDATION_LIMITS constant */
export type ImageValidationLimitsType = typeof IMAGE_VALIDATION_LIMITS;

/**
 * @interface ImageValidationExtensionsType
 * @description Allowed file extensions for image uploads.
 *
 * @property {string} PNG - PNG file extension
 * @property {string} JPG - JPG file extension
 * @property {string} JPEG - JPEG file extension
 */
export const IMAGE_VALIDATION_EXTENSIONS = {
  PNG: '.png',
  JPG: '.jpg',
  JPEG: '.jpeg',
} as const;

/** Type representing the IMAGE_VALIDATION_EXTENSIONS constant */
export type ImageValidationExtensionsType = typeof IMAGE_VALIDATION_EXTENSIONS;

/**
 * @interface ImageValidationSignaturesType
 * @description File signature (magic bytes) patterns for format detection.
 *
 * @property {number[]} PNG - PNG file signature bytes
 * @property {number[]} JPEG - JPEG file signature bytes
 */
export const IMAGE_VALIDATION_SIGNATURES = {
  /** PNG signature: 89 50 4E 47 0D 0A 1A 0A */
  PNG: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  /** JPEG signature: FF D8 FF */
  JPEG: [0xff, 0xd8, 0xff],
} as const;

/** Type representing the IMAGE_VALIDATION_SIGNATURES constant */
export type ImageValidationSignaturesType = typeof IMAGE_VALIDATION_SIGNATURES;

/**
 * @interface ImageValidationErrorCodesType
 * @description Error codes for validation failures.
 *
 * @property {string} FILE_TOO_LARGE - File exceeds maximum size
 * @property {string} INVALID_EXTENSION - File extension not allowed
 * @property {string} INVALID_FORMAT - File format doesn't match extension
 * @property {string} CORRUPTED_FILE - File appears corrupted
 * @property {string} NOT_AN_IMAGE - File is not a valid image
 */
export const IMAGE_VALIDATION_ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_EXTENSION: 'INVALID_EXTENSION',
  INVALID_FORMAT: 'INVALID_FORMAT',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  NOT_AN_IMAGE: 'NOT_AN_IMAGE',
} as const;

/** Type representing the IMAGE_VALIDATION_ERROR_CODES constant */
export type ImageValidationErrorCodesType = typeof IMAGE_VALIDATION_ERROR_CODES;
