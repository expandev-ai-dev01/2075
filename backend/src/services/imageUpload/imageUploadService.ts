/**
 * @summary
 * Business logic for ImageUpload functionality.
 * Handles file upload, validation, and session management using in-memory storage.
 *
 * @module services/imageUpload/imageUploadService
 */

import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { imageUploadStore } from '@/instances';
import { ServiceError } from '@/utils';
import { validateImageFile } from '@/services/imageValidation';
import {
  ImageUploadCreateResponse,
  ImageUploadSessionResponse,
  ImageUploadResetResponse,
} from './imageUploadTypes';
import { sessionParamsSchema } from './imageUploadValidation';

/**
 * @summary
 * Processes file upload with comprehensive validation.
 *
 * @function imageUploadCreate
 * @module services/imageUpload
 *
 * @param {Request} req - Express request object containing file data
 * @returns {Promise<ImageUploadCreateResponse>} Upload confirmation with session details
 *
 * @throws {ServiceError} VALIDATION_ERROR (400) - When no file is provided
 * @throws {ServiceError} INVALID_FORMAT (400) - When file format is invalid
 * @throws {ServiceError} FILE_TOO_LARGE (400) - When file exceeds size limit
 * @throws {ServiceError} SESSION_LIMIT_REACHED (400) - When session already has a file
 *
 * @example
 * const result = await imageUploadCreate(req);
 * // Returns: { sessionId: 'uuid', fileName: 'image.png', fileSize: 12345, ... }
 */
export async function imageUploadCreate(req: Request): Promise<ImageUploadCreateResponse> {
  /**
   * @validation Ensure file is present in request
   * @throws {ServiceError} VALIDATION_ERROR
   */
  if (!req.file) {
    throw new ServiceError('VALIDATION_ERROR', 'Nenhum arquivo foi selecionado', 400);
  }

  const { originalname, mimetype, size, buffer } = req.file;

  /**
   * @rule {BR-020} Execute validations in order: size, extension, format, integrity
   * @rule {BR-021} Stop at first validation error
   * @integration Integrate with ImageValidation service
   */
  const validationResult = await validateImageFile({
    fileName: originalname,
    fileSize: size,
    mimeType: mimetype,
    fileBuffer: buffer,
  });

  /**
   * @validation Check if file passed all validations
   * @throws {ServiceError} Validation error from ImageValidation service
   * @rule {BR-022} Allow upload only if all validations pass
   */
  if (!validationResult.isValid) {
    throw new ServiceError(
      validationResult.errorCode || 'VALIDATION_ERROR',
      validationResult.errorMessage || 'Falha na validação do arquivo',
      400,
      validationResult.details
    );
  }

  /**
   * @rule {BR-001} Check if session already has a file
   */
  const sessionId = req.headers['x-session-id'] as string | undefined;
  if (sessionId) {
    const existingSession = imageUploadStore.getBySessionId(sessionId);
    if (existingSession && existingSession.status === 'concluida') {
      throw new ServiceError(
        'SESSION_LIMIT_REACHED',
        'Um arquivo já foi processado nesta sessão. Por favor, clique em "Iniciar Novo Upload" para fazer um novo upload',
        400
      );
    }
  }

  /**
   * @rule {BR-014} Create or update session
   */
  const newSessionId = sessionId || uuidv4();
  const now = new Date().toISOString();

  const session = imageUploadStore.createOrUpdate(newSessionId, {
    sessionId: newSessionId,
    status: 'concluida',
    fileName: originalname,
    fileSize: size,
    mimeType: mimetype,
    fileBuffer: buffer,
    createdAt: sessionId ? imageUploadStore.getBySessionId(sessionId)?.createdAt || now : now,
    updatedAt: now,
  });

  return {
    sessionId: session.sessionId,
    fileName: session.fileName!,
    fileSize: session.fileSize!,
    mimeType: session.mimeType!,
    status: session.status,
    uploadedAt: session.updatedAt,
  };
}

/**
 * @summary
 * Retrieves session status and details.
 *
 * @function imageUploadGetSession
 * @module services/imageUpload
 *
 * @param {unknown} params - Raw request params containing sessionId
 * @returns {Promise<ImageUploadSessionResponse>} Session details
 *
 * @throws {ServiceError} VALIDATION_ERROR (400) - When sessionId is invalid
 * @throws {ServiceError} NOT_FOUND (404) - When session doesn't exist
 *
 * @example
 * const session = await imageUploadGetSession({ sessionId: 'uuid' });
 * // Returns: { sessionId: 'uuid', status: 'concluida', fileName: 'image.png', ... }
 */
export async function imageUploadGetSession(params: unknown): Promise<ImageUploadSessionResponse> {
  const validation = sessionParamsSchema.safeParse(params);

  if (!validation.success) {
    throw new ServiceError(
      'VALIDATION_ERROR',
      'ID de sessão inválido',
      400,
      validation.error.errors
    );
  }

  const { sessionId } = validation.data;
  const session = imageUploadStore.getBySessionId(sessionId);

  if (!session) {
    throw new ServiceError('NOT_FOUND', 'Sessão não encontrada', 404);
  }

  return {
    sessionId: session.sessionId,
    status: session.status,
    fileName: session.fileName,
    fileSize: session.fileSize,
    createdAt: session.createdAt,
  };
}

/**
 * @summary
 * Resets session to allow new upload.
 *
 * @function imageUploadResetSession
 * @module services/imageUpload
 *
 * @param {unknown} params - Raw request params containing sessionId
 * @returns {Promise<ImageUploadResetResponse>} New session details
 *
 * @throws {ServiceError} VALIDATION_ERROR (400) - When sessionId is invalid
 * @throws {ServiceError} NOT_FOUND (404) - When session doesn't exist
 *
 * @example
 * const result = await imageUploadResetSession({ sessionId: 'uuid' });
 * // Returns: { sessionId: 'new-uuid', status: 'nova', message: 'Sessão reiniciada' }
 */
export async function imageUploadResetSession(params: unknown): Promise<ImageUploadResetResponse> {
  const validation = sessionParamsSchema.safeParse(params);

  if (!validation.success) {
    throw new ServiceError(
      'VALIDATION_ERROR',
      'ID de sessão inválido',
      400,
      validation.error.errors
    );
  }

  const { sessionId } = validation.data;
  const existingSession = imageUploadStore.getBySessionId(sessionId);

  if (!existingSession) {
    throw new ServiceError('NOT_FOUND', 'Sessão não encontrada', 404);
  }

  /**
   * @rule {BR-016} Clear previous session data and create new session
   */
  imageUploadStore.delete(sessionId);
  const newSessionId = uuidv4();
  const now = new Date().toISOString();

  imageUploadStore.createOrUpdate(newSessionId, {
    sessionId: newSessionId,
    status: 'nova',
    fileName: null,
    fileSize: null,
    mimeType: null,
    fileBuffer: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    sessionId: newSessionId,
    status: 'nova',
    message: 'Sessão reiniciada com sucesso',
  };
}
