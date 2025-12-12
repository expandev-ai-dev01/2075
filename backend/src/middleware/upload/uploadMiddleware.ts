/**
 * @summary
 * Multer middleware configuration for file uploads.
 * Handles multipart/form-data parsing with memory storage.
 *
 * @module middleware/upload/uploadMiddleware
 */

import multer from 'multer';
import { IMAGE_UPLOAD_LIMITS } from '@/constants/imageUpload';

/**
 * @rule {be-file-upload-config}
 * Configure multer for in-memory file storage
 */
const storage = multer.memoryStorage();

/**
 * @rule {PE-002}
 * Configure file size limits and field name
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: IMAGE_UPLOAD_LIMITS.MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Multer middleware for single file upload
 * Field name: 'file'
 */
export const uploadMiddleware = upload.single('file');
