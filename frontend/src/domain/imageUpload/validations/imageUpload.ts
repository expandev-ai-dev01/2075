/**
 * @summary
 * Validation schemas for image upload.
 * Defines client-side validation rules using Zod.
 *
 * @module domain/imageUpload/validations/imageUpload
 */

import { z } from 'zod';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg'] as const;

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, {
      message: 'Arquivo é obrigatório',
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: 'O arquivo excede o limite de 15MB',
    })
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]),
      {
        message: 'O arquivo selecionado não é uma imagem PNG ou JPEG válida',
      }
    ),
});

export type ImageUploadFormInput = z.input<typeof imageUploadSchema>;
export type ImageUploadFormOutput = z.output<typeof imageUploadSchema>;
