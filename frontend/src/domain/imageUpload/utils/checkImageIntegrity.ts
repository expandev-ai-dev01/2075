/**
 * @summary
 * Utility to check image file integrity and extract metadata.
 * Validates that file can be loaded as an image and extracts dimensions.
 *
 * @module domain/imageUpload/utils/checkImageIntegrity
 */

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  isValid: boolean;
}

/**
 * Checks if file is a valid image and extracts metadata.
 * Attempts to load the image to verify integrity.
 *
 * @param file - File to check
 * @returns Promise with image metadata or null if invalid
 */
export async function checkImageIntegrity(file: File): Promise<ImageMetadata | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const metadata: ImageMetadata = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        isValid: true,
      };
      URL.revokeObjectURL(url);
      resolve(metadata);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Formats image dimensions as string.
 */
export function formatImageDimensions(metadata: ImageMetadata): string {
  return `${metadata.width}x${metadata.height}px`;
}
