/**
 * @summary
 * Validation schemas and utilities for ImageUpload.
 * Centralizes all validation logic including file type and size checks.
 *
 * @module services/imageUpload/imageUploadValidation
 */

import { z } from 'zod';
import { IMAGE_UPLOAD_LIMITS, IMAGE_UPLOAD_MIME_TYPES } from '@/constants';
import { ServiceError } from '@/utils';

/**
 * Schema for session ID parameter validation
 */
export const sessionParamsSchema = z.object({
  sessionId: z.string().uuid(),
});

/**
 * Inferred types from schemas
 */
export type SessionParamsInput = z.infer<typeof sessionParamsSchema>;

/**
 * @summary
 * Validates file MIME type against allowed types
 *
 * @param {string} mimeType - MIME type to validate
 * @throws {ServiceError} INVALID_FORMAT (400) - When MIME type is not allowed
 */
export function validateMimeType(mimeType: string): void {
  const allowedTypes: string[] = [
    IMAGE_UPLOAD_MIME_TYPES.PNG,
    IMAGE_UPLOAD_MIME_TYPES.JPEG,
    IMAGE_UPLOAD_MIME_TYPES.JPG,
  ];

  if (!allowedTypes.includes(mimeType)) {
    throw new ServiceError(
      'INVALID_FORMAT',
      'O arquivo selecionado não é uma imagem PNG ou JPEG válida',
      400
    );
  }
}

/**
 * @summary
 * Validates file size against maximum limit
 *
 * @param {number} fileSize - File size in bytes
 * @throws {ServiceError} FILE_TOO_LARGE (400) - When file exceeds size limit
 */
export function validateFileSize(fileSize: number): void {
  if (fileSize > IMAGE_UPLOAD_LIMITS.MAX_FILE_SIZE) {
    throw new ServiceError('FILE_TOO_LARGE', 'O arquivo excede o limite de 15MB', 400);
  }
}

/**
 * @summary
 * Validates file signature (magic bytes) to confirm it's a real image
 *
 * @param {Buffer} buffer - File buffer to validate
 * @throws {ServiceError} INVALID_FORMAT (400) - When file signature doesn't match PNG or JPEG
 */
export function validateFileSignature(buffer: Buffer): void {
  if (buffer.length < 4) {
    throw new ServiceError(
      'INVALID_FORMAT',
      'O arquivo selecionado parece estar corrompido ou não é uma imagem válida',
      400
    );
  }

  // PNG signature: 89 50 4E 47
  const isPNG =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

  // JPEG signature: FF D8 FF
  const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  if (!isPNG && !isJPEG) {
    throw new ServiceError('INVALID_FORMAT', 'A imagem parece estar corrompida ou incompleta', 400);
  }
}
