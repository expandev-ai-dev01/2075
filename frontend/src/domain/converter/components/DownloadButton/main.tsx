/**
 * @summary
 * Download button component for base64 conversion results.
 * Provides visual feedback and handles download initiation.
 *
 * @module domain/converter/components/DownloadButton/main
 */

import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/core/components/button';
import { cn } from '@/core/lib/utils';
import { useDownloadResult } from '../../hooks/useDownloadResult';
import type { DownloadButtonProps } from './types';

/**
 * Button component for downloading base64 conversion results.
 * Displays different states (idle, loading, success, error) with appropriate icons.
 *
 * @param props - Component properties
 */
function DownloadButton({
  base64Content,
  fileName,
  fileType,
  disabled = false,
  className,
}: DownloadButtonProps) {
  const { downloadStatus, downloadResult } = useDownloadResult({
    base64Content,
    fileName,
    fileType,
    autoDownload: false,
  });

  const isDisabled = disabled || !base64Content || downloadStatus.status === 'downloading';
  const isLoading =
    downloadStatus.status === 'preparing' || downloadStatus.status === 'downloading';
  const isSuccess = downloadStatus.status === 'completed';
  const isError = downloadStatus.status === 'error';

  const getButtonText = () => {
    switch (downloadStatus.status) {
      case 'preparing':
        return 'Preparando...';
      case 'downloading':
        return 'Baixando...';
      case 'completed':
        return 'Download concluído';
      case 'error':
        return 'Tentar novamente';
      default:
        return 'Baixar resultado';
    }
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="size-4 animate-spin" />;
    }
    if (isSuccess) {
      return <CheckCircle2 className="size-4" />;
    }
    if (isError) {
      return <AlertCircle className="size-4" />;
    }
    return <Download className="size-4" />;
  };

  return (
    <Button
      onClick={downloadResult}
      disabled={isDisabled}
      variant={isError ? 'destructive' : isSuccess ? 'secondary' : 'default'}
      className={cn(
        'transition-all duration-200',
        isSuccess && 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
        className
      )}
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}

export { DownloadButton };
