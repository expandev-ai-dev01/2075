/**
 * @summary
 * Custom hook for managing image upload functionality.
 * Handles upload state, progress tracking, and session management.
 *
 * @module domain/imageUpload/hooks/useImageUpload/main
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as imageUploadService from '../../services/imageUploadService';
import type { UploadStatus } from '../../types/models';
import type { UseImageUploadReturn } from './types';

/**
 * Hook for managing image upload operations.
 * Provides upload functionality with progress tracking and error handling.
 *
 * @returns Upload state and control functions
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const queryClient = useQueryClient();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('aguardando');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string>();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadStatus('processando');
      setUploadProgress(0);

      return imageUploadService.uploadImage({
        file,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });
    },
    onSuccess: (data) => {
      setUploadStatus('concluído');
      setUploadProgress(100);
      setSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ['imageUpload'] });
      toast.success('Upload concluído', {
        description: 'Imagem enviada com sucesso',
      });
    },
    onError: (error: Error) => {
      setUploadStatus('erro');
      setUploadProgress(0);
      toast.error('Erro no upload', {
        description: error.message,
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) {
        throw new Error('Nenhuma sessão ativa para reiniciar');
      }
      return imageUploadService.resetSession(sessionId);
    },
    onSuccess: (data) => {
      setUploadStatus('aguardando');
      setUploadProgress(0);
      setSessionId(data.sessionId);
      uploadMutation.reset();
      queryClient.invalidateQueries({ queryKey: ['imageUpload'] });
      toast.success('Sessão reiniciada', {
        description: 'Você pode fazer um novo upload',
      });
    },
    onError: (error: Error) => {
      toast.error('Erro ao reiniciar', {
        description: error.message,
      });
    },
  });

  const uploadImage = useCallback(
    async (file: File) => {
      await uploadMutation.mutateAsync(file);
    },
    [uploadMutation]
  );

  const resetUpload = useCallback(async () => {
    await resetMutation.mutateAsync();
  }, [resetMutation]);

  const canUpload = uploadStatus === 'aguardando' && !uploadMutation.isPending;

  return {
    uploadImage,
    resetUpload,
    uploadStatus,
    uploadProgress,
    uploadResult: uploadMutation.data,
    error: uploadMutation.error?.message,
    isUploading: uploadMutation.isPending,
    canUpload,
  };
};
