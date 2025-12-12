/**
 * @summary
 * Validation schemas and utilities for ImageUpload.
 * Centralizes all validation logic for session management.
 *
 * @module services/imageUpload/imageUploadValidation
 */

import { z } from 'zod';

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
