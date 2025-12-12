/**
 * @summary
 * API controller for Image Upload functionality.
 * Handles file upload, validation, and session management.
 *
 * @module api/internal/image-upload/controller
 */

import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse, isServiceError } from '@/utils';
import {
  imageUploadCreate,
  imageUploadGetSession,
  imageUploadResetSession,
} from '@/services/imageUpload';

/**
 * @api {post} /api/internal/image-upload Upload Image
 * @apiName UploadImage
 * @apiGroup ImageUpload
 *
 * @apiBody {File} file Image file (PNG or JPEG, max 15MB)
 *
 * @apiSuccess {Boolean} success Success flag (always true)
 * @apiSuccess {String} data.sessionId Session identifier
 * @apiSuccess {String} data.fileName Original file name
 * @apiSuccess {Number} data.fileSize File size in bytes
 * @apiSuccess {String} data.mimeType File MIME type
 * @apiSuccess {String} data.status Upload status (completed)
 * @apiSuccess {String} data.uploadedAt ISO 8601 timestamp
 *
 * @apiError {Boolean} success Success flag (always false)
 * @apiError {String} error.code Error code (VALIDATION_ERROR | FILE_TOO_LARGE | INVALID_FORMAT | SESSION_LIMIT_REACHED)
 * @apiError {String} error.message Error message
 */
export async function uploadHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await imageUploadCreate(req);
    res.status(201).json(successResponse(data));
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details));
      return;
    }
    next(error);
  }
}

/**
 * @api {get} /api/internal/image-upload/session/:sessionId Get Session Status
 * @apiName GetSessionStatus
 * @apiGroup ImageUpload
 *
 * @apiParam {String} sessionId Session identifier
 *
 * @apiSuccess {Boolean} success Success flag (always true)
 * @apiSuccess {String} data.sessionId Session identifier
 * @apiSuccess {String} data.status Session status (nova | em_andamento | concluida | erro)
 * @apiSuccess {String|null} data.fileName Original file name (if uploaded)
 * @apiSuccess {Number|null} data.fileSize File size in bytes (if uploaded)
 * @apiSuccess {String} data.createdAt ISO 8601 timestamp
 *
 * @apiError {Boolean} success Success flag (always false)
 * @apiError {String} error.code Error code (NOT_FOUND | VALIDATION_ERROR)
 * @apiError {String} error.message Error message
 */
export async function getSessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await imageUploadGetSession(req.params);
    res.json(successResponse(data));
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details));
      return;
    }
    next(error);
  }
}

/**
 * @api {post} /api/internal/image-upload/session/:sessionId/reset Reset Session
 * @apiName ResetSession
 * @apiGroup ImageUpload
 *
 * @apiParam {String} sessionId Session identifier
 *
 * @apiSuccess {Boolean} success Success flag (always true)
 * @apiSuccess {String} data.sessionId New session identifier
 * @apiSuccess {String} data.status Session status (nova)
 * @apiSuccess {String} data.message Confirmation message
 *
 * @apiError {Boolean} success Success flag (always false)
 * @apiError {String} error.code Error code (NOT_FOUND | VALIDATION_ERROR)
 * @apiError {String} error.message Error message
 */
export async function resetSessionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await imageUploadResetSession(req.params);
    res.json(successResponse(data));
  } catch (error) {
    if (isServiceError(error)) {
      res.status(error.statusCode).json(errorResponse(error.message, error.code, error.details));
      return;
    }
    next(error);
  }
}
