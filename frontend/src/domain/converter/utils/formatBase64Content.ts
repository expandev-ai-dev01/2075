/**
 * @summary
 * Utility to format base64 content with header and line breaks.
 * Ensures the output is readable and properly structured.
 *
 * @module domain/converter/utils/formatBase64Content
 */

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FormatBase64Options {
  base64Content: string;
  fileName?: string;
  fileType?: string;
}

/**
 * Formats base64 content with descriptive header and line breaks.
 * Adds metadata about the conversion and formats content for readability.
 *
 * @param options - Formatting configuration
 * @returns Formatted text content ready for download
 */
export const formatBase64Content = ({
  base64Content,
  fileName,
  fileType,
}: FormatBase64Options): string => {
  const timestamp = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

  // Build header with metadata
  const header = [
    '='.repeat(80),
    'RESULTADO DA CONVERSÃO PARA BASE64',
    '='.repeat(80),
    '',
    `Data de geração: ${timestamp}`,
  ];

  if (fileName) {
    header.push(`Arquivo original: ${fileName}`);
  }

  if (fileType) {
    header.push(`Tipo de arquivo: ${fileType}`);
  }

  header.push('', 'CONTEÚDO BASE64:', '-'.repeat(80), '');

  // Format base64 content with line breaks every 76 characters (RFC 2045)
  const formattedBase64 = base64Content.match(/.{1,76}/g)?.join('\n') || base64Content;

  // Build footer
  const footer = ['', '-'.repeat(80), 'FIM DO CONTEÚDO', '='.repeat(80)];

  return [...header, formattedBase64, ...footer].join('\n');
};
