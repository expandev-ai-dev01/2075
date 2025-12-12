/**
 * @summary
 * Utility function to trigger file download in the browser.
 * Creates a temporary anchor element to initiate download with proper headers.
 *
 * @module domain/converter/utils/downloadFile
 */

import DOMPurify from 'dompurify';
import { format } from 'date-fns';

export interface DownloadFileOptions {
  content: string;
  fileName?: string;
  mimeType?: string;
}

/**
 * Downloads a text file with the provided content.
 * Sanitizes content and generates a timestamped filename.
 *
 * @param options - Download configuration
 * @throws {Error} If content is empty or download fails
 */
export const downloadFile = ({
  content,
  fileName,
  mimeType = 'text/plain',
}: DownloadFileOptions): void => {
  if (!content || content.trim().length === 0) {
    throw new Error('Content cannot be empty');
  }

  // Sanitize content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(content);

  // Generate filename with timestamp if not provided
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  const finalFileName = fileName || `resultado_conversao_${timestamp}.txt`;

  // Create blob with UTF-8 encoding
  const blob = new Blob([sanitizedContent], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  try {
    // Create temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFileName;
    anchor.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    // Clean up object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
};
