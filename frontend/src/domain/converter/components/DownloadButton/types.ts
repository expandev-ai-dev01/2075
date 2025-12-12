/**
 * @summary
 * Type definitions for DownloadButton component.
 *
 * @module domain/converter/components/DownloadButton/types
 */

export interface DownloadButtonProps {
  base64Content?: string;
  fileName?: string;
  fileType?: string;
  disabled?: boolean;
  className?: string;
}
