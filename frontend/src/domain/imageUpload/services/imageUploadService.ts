/**
 * @summary
 * Service for image upload operations.
 * Handles API communication for file uploads and session management.
 *
 * @module domain/imageUpload/services/imageUploadService
 * @service imageUploadService
 * @domain imageUpload
 * @type REST
 */

import { authenticatedClient } from '@/core/lib/api';
import type { ImageUpload, ImageUploadSession } from '../types/models';

export interface UploadImageParams {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Uploads an image file to the server.
 * Supports progress tracking via callback.
 *
 * @param params - Upload parameters including file and progress callback
 * @returns Promise with upload result
 */
export const uploadImage = async ({
  file,
  onProgress,
}: UploadImageParams): Promise<ImageUpload> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await authenticatedClient.post<ApiResponse<ImageUpload>>(
    '/image-upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    }
  );

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Erro ao fazer upload da imagem');
  }

  return data.data;
};

/**
 * Retrieves the current session status.
 *
 * @param sessionId - Session identifier
 * @returns Promise with session data
 */
export const getSession = async (sessionId: string): Promise<ImageUploadSession> => {
  const { data } = await authenticatedClient.get<ApiResponse<ImageUploadSession>>(
    `/image-upload/session/${sessionId}`
  );

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Erro ao buscar sessão');
  }

  return data.data;
};

/**
 * Resets the current session to allow a new upload.
 *
 * @param sessionId - Session identifier to reset
 * @returns Promise with new session data
 */
export const resetSession = async (sessionId: string): Promise<ImageUploadSession> => {
  const { data } = await authenticatedClient.post<ApiResponse<ImageUploadSession>>(
    `/image-upload/session/${sessionId}/reset`
  );

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Erro ao reiniciar sessão');
  }

  return data.data;
};
