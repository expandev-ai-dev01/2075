/**
 * @summary
 * Business logic for Image Validation functionality.
 * Implements comprehensive file validation following the specification requirements.
 *
 * @module services/imageValidation/imageValidationService
 */

import {
  IMAGE_VALIDATION_LIMITS,
  IMAGE_VALIDATION_EXTENSIONS,
  IMAGE_VALIDATION_SIGNATURES,
  IMAGE_VALIDATION_ERROR_CODES,
} from '@/constants';
import { ServiceError } from '@/utils';
import { ValidationResult, ValidationDetails, FileValidationInput } from './imageValidationTypes';

/**
 * @summary
 * Validates file size against maximum limit.
 *
 * @function validateFileSize
 * @module services/imageValidation
 *
 * @param {number} fileSize - File size in bytes
 * @returns {boolean} True if size is valid
 *
 * @throws {ServiceError} FILE_TOO_LARGE (400) - When file exceeds size limit
 *
 * @rule {BR-001} Limit file size to configured maximum (15MB)
 * @rule {BR-002} Reject files larger than limit
 * @rule {BR-003} Size validation is first check
 */
function validateFileSize(fileSize: number): boolean {
  /**
   * @validation Check minimum file size
   * @throws {ServiceError} CORRUPTED_FILE
   */
  if (fileSize < IMAGE_VALIDATION_LIMITS.MIN_FILE_SIZE) {
    throw new ServiceError(
      IMAGE_VALIDATION_ERROR_CODES.CORRUPTED_FILE,
      'O arquivo parece estar vazio ou corrompido',
      400
    );
  }

  /**
   * @validation Check maximum file size
   * @throws {ServiceError} FILE_TOO_LARGE
   * @rule {VA-001} File size validation message
   */
  if (fileSize > IMAGE_VALIDATION_LIMITS.MAX_FILE_SIZE) {
    throw new ServiceError(
      IMAGE_VALIDATION_ERROR_CODES.FILE_TOO_LARGE,
      'O arquivo excede o tamanho máximo permitido de 15MB. Por favor, envie um arquivo menor.',
      400
    );
  }

  return true;
}

/**
 * @summary
 * Extracts and validates file extension.
 *
 * @function validateFileExtension
 * @module services/imageValidation
 *
 * @param {string} fileName - Original file name
 * @returns {string} Validated extension in lowercase
 *
 * @throws {ServiceError} INVALID_EXTENSION (400) - When extension is not allowed
 *
 * @rule {BR-004} Accept only .png, .jpg, .jpeg extensions
 * @rule {BR-005} Extension validation after size check
 */
function validateFileExtension(fileName: string): '.png' | '.jpg' | '.jpeg' {
  /**
   * @validation Extract file extension
   * @rule {RU-005} Convert to lowercase for comparison
   */
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  /**
   * @validation Check if extension is allowed
   * @throws {ServiceError} INVALID_EXTENSION
   * @rule {VA-002} Extension validation message
   */
  const allowedExtensions: Array<'.png' | '.jpg' | '.jpeg'> = [
    IMAGE_VALIDATION_EXTENSIONS.PNG,
    IMAGE_VALIDATION_EXTENSIONS.JPG,
    IMAGE_VALIDATION_EXTENSIONS.JPEG,
  ];

  if (!allowedExtensions.includes(extension as '.png' | '.jpg' | '.jpeg')) {
    throw new ServiceError(
      IMAGE_VALIDATION_ERROR_CODES.INVALID_EXTENSION,
      'O formato do arquivo não é suportado. Por favor, envie apenas imagens PNG ou JPEG.',
      400
    );
  }

  return extension as '.png' | '.jpg' | '.jpeg';
}

/**
 * @summary
 * Detects file format from signature (magic bytes).
 *
 * @function detectFileFormat
 * @module services/imageValidation
 *
 * @param {Buffer} fileBuffer - File content buffer
 * @returns {string|null} Detected format ('png' or 'jpeg') or null
 *
 * @rule {BR-006} Verify format matches extension
 * @rule {SE-003} Check file signature to prevent malicious uploads
 */
function detectFileFormat(fileBuffer: Buffer): string | null {
  /**
   * @validation Check buffer has enough bytes
   */
  if (fileBuffer.length < IMAGE_VALIDATION_LIMITS.HEADER_BYTES_TO_READ) {
    return null;
  }

  /**
   * @validation Check PNG signature
   * @rule {AC-009} Identify PNG by header
   */
  const pngSignature = IMAGE_VALIDATION_SIGNATURES.PNG;
  const isPNG = pngSignature.every((byte, index) => fileBuffer[index] === byte);
  if (isPNG) {
    return 'png';
  }

  /**
   * @validation Check JPEG signature
   * @rule {AC-010} Identify JPEG by header
   */
  const jpegSignature = IMAGE_VALIDATION_SIGNATURES.JPEG;
  const isJPEG = jpegSignature.every((byte, index) => fileBuffer[index] === byte);
  if (isJPEG) {
    return 'jpeg';
  }

  return null;
}

/**
 * @summary
 * Validates file format matches extension.
 *
 * @function validateFileFormat
 * @module services/imageValidation
 *
 * @param {string} extension - File extension
 * @param {Buffer} fileBuffer - File content buffer
 * @returns {string} Detected format
 *
 * @throws {ServiceError} INVALID_FORMAT (400) - When format doesn't match extension
 * @throws {ServiceError} NOT_AN_IMAGE (400) - When file is not a valid image
 *
 * @rule {BR-007} Reject files where format doesn't match extension
 * @rule {BR-008} Format validation after extension check
 */
function validateFileFormat(extension: '.png' | '.jpg' | '.jpeg', fileBuffer: Buffer): string {
  /**
   * @validation Detect actual file format
   */
  const detectedFormat = detectFileFormat(fileBuffer);

  /**
   * @validation Check if file is a valid image
   * @throws {ServiceError} NOT_AN_IMAGE
   * @rule {VA-005} Not an image validation message
   */
  if (!detectedFormat) {
    throw new ServiceError(
      IMAGE_VALIDATION_ERROR_CODES.NOT_AN_IMAGE,
      'O arquivo enviado não é uma imagem válida. Por favor, envie apenas imagens PNG ou JPEG.',
      400
    );
  }

  /**
   * @validation Check format matches extension
   * @throws {ServiceError} INVALID_FORMAT
   * @rule {VA-003} Format mismatch validation message
   * @rule {AC-011} Reject files where format doesn't match extension
   */
  const extensionFormat = extension === '.png' ? 'png' : 'jpeg';
  if (detectedFormat !== extensionFormat) {
    throw new ServiceError(
      IMAGE_VALIDATION_ERROR_CODES.INVALID_FORMAT,
      'O formato real do arquivo não corresponde à sua extensão. Por favor, verifique o arquivo.',
      400
    );
  }

  return detectedFormat;
}

/**
 * @summary
 * Validates file integrity by attempting to parse image structure.
 *
 * @function validateFileIntegrity
 * @module services/imageValidation
 *
 * @param {Buffer} fileBuffer - File content buffer
 * @param {string} format - Detected file format
 * @returns {boolean} True if file integrity is valid
 *
 * @throws {ServiceError} CORRUPTED_FILE (400) - When file is corrupted
 *
 * @rule {BR-010} Verify file is not corrupted
 * @rule {BR-011} Reject corrupted files
 * @rule {BR-012} Integrity check after format validation
 */
function validateFileIntegrity(fileBuffer: Buffer, format: string): boolean {
  /**
   * @validation Basic integrity checks based on format
   */
  try {
    if (format === 'png') {
      /**
       * @validation PNG integrity: Check for IEND chunk at end
       * PNG files must end with IEND chunk: 00 00 00 00 49 45 4E 44 AE 42 60 82
       */
      const pngEndSignature = [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82];
      const endOffset = fileBuffer.length - 8;
      const hasValidEnd = pngEndSignature.every(
        (byte, index) => fileBuffer[endOffset + index] === byte
      );

      if (!hasValidEnd) {
        throw new ServiceError(
          IMAGE_VALIDATION_ERROR_CODES.CORRUPTED_FILE,
          'O arquivo PNG parece estar corrompido ou danificado. Por favor, tente enviar outro arquivo.',
          400
        );
      }
    } else if (format === 'jpeg') {
      /**
       * @validation JPEG integrity: Check for EOI marker at end
       * JPEG files must end with EOI marker: FF D9
       */
      const jpegEndMarker = [0xff, 0xd9];
      const endOffset = fileBuffer.length - 2;
      const hasValidEnd = jpegEndMarker.every(
        (byte, index) => fileBuffer[endOffset + index] === byte
      );

      if (!hasValidEnd) {
        throw new ServiceError(
          IMAGE_VALIDATION_ERROR_CODES.CORRUPTED_FILE,
          'O arquivo JPEG parece estar corrompido ou danificado. Por favor, tente enviar outro arquivo.',
          400
        );
      }
    }

    return true;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    /**
     * @validation Catch any unexpected errors during integrity check
     * @throws {ServiceError} CORRUPTED_FILE
     * @rule {VA-006} Corrupted file validation message
     */
    throw new ServiceError(
      IMAGE_VALIDATION_ERROR_CODES.CORRUPTED_FILE,
      'O arquivo parece estar corrompido ou danificado. Por favor, tente enviar outro arquivo.',
      400
    );
  }
}

/**
 * @summary
 * Performs complete file validation following all business rules.
 *
 * @function validateImageFile
 * @module services/imageValidation
 *
 * @param {FileValidationInput} input - File data to validate
 * @returns {Promise<ValidationResult>} Validation result with details
 *
 * @throws {ServiceError} Various validation errors (400)
 *
 * @rule {BR-020} Execute validations in order: size, extension, format, integrity
 * @rule {BR-021} Stop at first error
 * @rule {BR-022} Allow conversion only if all validations pass
 *
 * @example
 * const result = await validateImageFile({
 *   fileName: 'image.png',
 *   fileSize: 1024000,
 *   mimeType: 'image/png',
 *   fileBuffer: buffer
 * });
 * // Returns: { isValid: true, errorCode: null, errorMessage: null, details: {...} }
 */
export async function validateImageFile(input: FileValidationInput): Promise<ValidationResult> {
  const details: ValidationDetails = {
    sizeValid: false,
    extensionValid: false,
    formatValid: false,
    signatureValid: false,
    integrityValid: false,
    detectedFormat: null,
    declaredExtension: null,
  };

  try {
    /**
     * @rule {BR-003} Size validation is first check
     * @rule {AC-001} Accept files smaller than limit
     * @rule {AC-002} Accept files equal to limit
     * @rule {AC-003} Reject files larger than limit
     */
    validateFileSize(input.fileSize);
    details.sizeValid = true;

    /**
     * @rule {BR-005} Extension validation after size
     * @rule {AC-005} Accept .png extension
     * @rule {AC-006} Accept .jpg extension
     * @rule {AC-007} Accept .jpeg extension
     * @rule {AC-008} Reject other extensions
     */
    const extension = validateFileExtension(input.fileName);
    details.extensionValid = true;
    details.declaredExtension = extension;

    /**
     * @rule {BR-008} Format validation after extension
     * @rule {AC-012} Reject files with invalid headers
     * @rule {SE-004} Use signature analysis to confirm image
     */
    const detectedFormat = validateFileFormat(extension, input.fileBuffer);
    details.formatValid = true;
    details.signatureValid = true;
    details.detectedFormat = detectedFormat;

    /**
     * @rule {BR-012} Integrity check after format validation
     * @rule {AC-014} Identify corrupted PNG files
     * @rule {AC-015} Identify corrupted JPEG files
     * @rule {AC-016} Reject files that can't be decoded
     */
    validateFileIntegrity(input.fileBuffer, detectedFormat);
    details.integrityValid = true;

    /**
     * @rule {BR-022} All validations passed
     * @rule {VA-012} Success message
     */
    return {
      isValid: true,
      errorCode: null,
      errorMessage: null,
      details,
    };
  } catch (error) {
    /**
     * @rule {BR-021} Stop at first error
     * @rule {BR-018} Provide specific error messages
     */
    if (error instanceof ServiceError) {
      return {
        isValid: false,
        errorCode: error.code,
        errorMessage: error.message,
        details,
      };
    }

    /**
     * @validation Handle unexpected errors
     */
    return {
      isValid: false,
      errorCode: 'VALIDATION_ERROR',
      errorMessage: 'Erro inesperado durante a validação do arquivo',
      details,
    };
  }
}
