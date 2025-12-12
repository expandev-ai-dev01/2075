/**
 * @summary
 * Type definitions for useImageUpload hook.
 *
 * @module domain/imageUpload/hooks/useImageUpload/types
 */

import type { ImageUpload, UploadStatus, ValidationState } from '../../types/models';

export interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<void>;
  resetUpload: () => Promise<void>;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  uploadResult?: ImageUpload;
  error?: string;
  isUploading: boolean;
  canUpload: boolean;
  validationState: ValidationState;
}
