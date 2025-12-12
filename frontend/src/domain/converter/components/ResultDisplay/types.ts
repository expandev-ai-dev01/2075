/**
 * @summary
 * Type definitions for ResultDisplay component.
 *
 * @module domain/converter/components/ResultDisplay/types
 */

export interface ResultDisplayProps {
  base64Content: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  originalDimensions?: string;
  conversionDate?: Date;
  className?: string;
}
