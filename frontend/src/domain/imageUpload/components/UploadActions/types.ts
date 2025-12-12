/**
 * @summary
 * Type definitions for UploadActions component.
 *
 * @module domain/imageUpload/components/UploadActions/types
 */

export interface UploadActionsProps {
  onReset: () => void;
  showReset: boolean;
  isResetting?: boolean;
  className?: string;
}
