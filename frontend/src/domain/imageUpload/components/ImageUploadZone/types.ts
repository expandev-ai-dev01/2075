/**
 * @summary
 * Type definitions for ImageUploadZone component.
 *
 * @module domain/imageUpload/components/ImageUploadZone/types
 */

export interface ImageUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  className?: string;
}
