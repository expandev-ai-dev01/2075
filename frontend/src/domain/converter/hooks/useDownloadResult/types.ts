/**
 * @summary
 * Type definitions for useDownloadResult hook.
 *
 * @module domain/converter/hooks/useDownloadResult/types
 */

import type { DownloadStatus } from '../../types/models';

export interface UseDownloadResultOptions {
  base64Content?: string;
  fileName?: string;
  fileType?: string;
  autoDownload?: boolean;
}

export interface UseDownloadResultReturn {
  downloadStatus: DownloadStatus;
  downloadResult: () => void;
  resetDownload: () => void;
}
