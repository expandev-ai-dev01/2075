/**
 * @summary
 * Client-side image file validation utilities.
 * Performs format, size, and basic integrity checks before upload.
 *
 * @module domain/imageUpload/utils/validateImageFile
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  type: 'size' | 'extension' | 'format' | 'integrity';
  message: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg'];

// PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// JPEG magic bytes: FF D8 FF
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

/**
 * Validates file size against maximum allowed.
 */
function validateFileSize(file: File): ValidationError | null {
  if (file.size === 0) {
    return {
      type: 'size',
      message: 'O arquivo está vazio',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      type: 'size',
      message: `O arquivo excede o tamanho máximo permitido de ${sizeMB}MB. Por favor, envie um arquivo menor.`,
    };
  }

  return null;
}

/**
 * Validates file extension.
 */
function validateFileExtension(file: File): ValidationError | null {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      type: 'extension',
      message: 'O formato do arquivo não é suportado. Por favor, envie apenas imagens PNG ou JPEG.',
    };
  }

  return null;
}

/**
 * Validates MIME type.
 */
function validateMimeType(file: File): ValidationError | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return {
      type: 'format',
      message: 'O formato do arquivo não é suportado. Por favor, envie apenas imagens PNG ou JPEG.',
    };
  }

  return null;
}

/**
 * Reads file header bytes for magic number validation.
 */
async function readFileHeader(file: File, bytesToRead: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, bytesToRead);

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(reader.result));
      } else {
        reject(new Error('Failed to read file header'));
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Validates file format by checking magic bytes (file signature).
 */
async function validateFileFormat(file: File): Promise<ValidationError | null> {
  try {
    const header = await readFileHeader(file, 8);

    // Check PNG signature
    const isPNG = PNG_SIGNATURE.every((byte, index) => header[index] === byte);

    // Check JPEG signature
    const isJPEG = JPEG_SIGNATURE.every((byte, index) => header[index] === byte);

    if (!isPNG && !isJPEG) {
      return {
        type: 'format',
        message:
          'O formato real do arquivo não corresponde à sua extensão. Por favor, verifique o arquivo.',
      };
    }

    // Verify format matches extension
    const fileName = file.name.toLowerCase();
    if (isPNG && !fileName.endsWith('.png')) {
      return {
        type: 'format',
        message:
          'O arquivo é PNG mas tem extensão diferente. Por favor, renomeie o arquivo com extensão .png',
      };
    }

    if (isJPEG && !fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg')) {
      return {
        type: 'format',
        message:
          'O arquivo é JPEG mas tem extensão diferente. Por favor, renomeie o arquivo com extensão .jpg ou .jpeg',
      };
    }

    return null;
  } catch {
    return {
      type: 'format',
      message: 'Não foi possível verificar o formato do arquivo',
    };
  }
}

/**
 * Validates if file is actually an image by attempting to load it.
 */
async function validateImageIntegrity(file: File): Promise<ValidationError | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        type: 'integrity',
        message:
          'O arquivo parece estar corrompido ou danificado. Por favor, tente enviar outro arquivo.',
      });
    };

    img.src = url;
  });
}

/**
 * Performs comprehensive validation of image file.
 * Executes validations in order: size, extension, format, integrity.
 * Stops at first error found.
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  // 1. Validate size (fastest, no I/O)
  const sizeError = validateFileSize(file);
  if (sizeError) {
    return { isValid: false, errors: [sizeError] };
  }

  // 2. Validate extension (fast, no I/O)
  const extensionError = validateFileExtension(file);
  if (extensionError) {
    return { isValid: false, errors: [extensionError] };
  }

  // 3. Validate MIME type (fast, no I/O)
  const mimeError = validateMimeType(file);
  if (mimeError) {
    return { isValid: false, errors: [mimeError] };
  }

  // 4. Validate format via magic bytes (requires file read)
  const formatError = await validateFileFormat(file);
  if (formatError) {
    return { isValid: false, errors: [formatError] };
  }

  // 5. Validate integrity by loading image (slowest)
  const integrityError = await validateImageIntegrity(file);
  if (integrityError) {
    return { isValid: false, errors: [integrityError] };
  }

  return { isValid: true, errors: [] };
}
