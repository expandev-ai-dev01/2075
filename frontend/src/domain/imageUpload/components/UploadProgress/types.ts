/**
 * @summary
 * Type definitions for UploadProgress component.
 *
 * @module domain/imageUpload/components/UploadProgress/types
 */

import type { UploadStatus } from '../../types/models';

export interface UploadProgressProps {
  status: UploadStatus;
  progress: number;
  fileName?: string;
  className?: string;
}
