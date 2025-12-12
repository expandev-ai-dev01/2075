/**
 * @summary
 * Custom hook for managing base64 result download functionality.
 * Handles download state, error handling, and user feedback.
 *
 * @module domain/converter/hooks/useDownloadResult/main
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { downloadFile } from '../../utils/downloadFile';
import { formatBase64Content } from '../../utils/formatBase64Content';
import type { DownloadStatus } from '../../types/models';
import type { UseDownloadResultOptions, UseDownloadResultReturn } from './types';

/**
 * Hook for downloading base64 conversion results.
 * Provides download functionality with status tracking and error handling.
 *
 * @param options - Configuration options
 * @returns Download state and control functions
 */
export const useDownloadResult = ({
  base64Content,
  fileName,
  fileType,
  autoDownload = false,
}: UseDownloadResultOptions): UseDownloadResultReturn => {
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({
    status: 'idle',
  });

  const resetDownload = useCallback(() => {
    setDownloadStatus({ status: 'idle' });
  }, []);

  const downloadResult = useCallback(() => {
    if (!base64Content) {
      setDownloadStatus({
        status: 'error',
        message: 'Nenhum conteúdo disponível para download',
        errorType: 'other',
      });
      toast.error('Erro ao baixar', {
        description: 'Nenhum conteúdo disponível para download',
      });
      return;
    }

    try {
      setDownloadStatus({
        status: 'preparing',
        message: 'Preparando arquivo para download...',
      });

      // Format content with header and metadata
      const formattedContent = formatBase64Content({
        base64Content,
        fileName,
        fileType,
      });

      setDownloadStatus({
        status: 'downloading',
        message: 'Iniciando download...',
      });

      // Trigger download
      downloadFile({
        content: formattedContent,
      });

      setDownloadStatus({
        status: 'completed',
        message: 'Download concluído com sucesso',
      });

      toast.success('Download concluído', {
        description: 'O arquivo foi baixado com sucesso',
      });

      // Reset status after 5 seconds
      setTimeout(() => {
        setDownloadStatus({ status: 'idle' });
      }, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      let errorType: DownloadStatus['errorType'] = 'other';

      // Categorize error type
      if (errorMessage.includes('permission')) {
        errorType = 'permission_denied';
      } else if (errorMessage.includes('corrupt')) {
        errorType = 'file_corrupted';
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        errorType = 'no_connection';
      } else if (errorMessage.includes('server')) {
        errorType = 'server_error';
      }

      setDownloadStatus({
        status: 'error',
        message: errorMessage,
        errorType,
      });

      toast.error('Erro ao baixar arquivo', {
        description: errorMessage,
        action: {
          label: 'Tentar novamente',
          onClick: downloadResult,
        },
      });
    }
  }, [base64Content, fileName, fileType]);

  // Auto-download on mount if enabled and content is available
  useEffect(() => {
    if (autoDownload && base64Content) {
      downloadResult();
    }
  }, [autoDownload, base64Content, downloadResult]);

  return {
    downloadStatus,
    downloadResult,
    resetDownload,
  };
};
