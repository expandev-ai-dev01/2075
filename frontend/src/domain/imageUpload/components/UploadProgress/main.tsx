/**
 * @summary
 * Visual feedback component for upload progress.
 * Displays status, progress bar, and messages.
 *
 * @module domain/imageUpload/components/UploadProgress/main
 */

import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Progress } from '@/core/components/progress';
import { Card, CardContent } from '@/core/components/card';
import { Badge } from '@/core/components/badge';
import { cn } from '@/core/lib/utils';
import type { UploadProgressProps } from './types';

/**
 * Component for displaying upload progress and status.
 * Shows different states with appropriate icons and messages.
 */
function UploadProgress({ status, progress, fileName, className }: UploadProgressProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'aguardando':
        return {
          icon: <Clock className="size-5" />,
          label: 'Aguardando',
          message: 'Aguardando seleção de arquivo...',
          variant: 'secondary' as const,
          showProgress: false,
        };
      case 'processando':
        return {
          icon: <Loader2 className="size-5 animate-spin" />,
          label: 'Processando',
          message: 'Enviando arquivo...',
          variant: 'default' as const,
          showProgress: true,
        };
      case 'concluído':
        return {
          icon: <CheckCircle2 className="size-5" />,
          label: 'Concluído',
          message: 'Upload concluído com sucesso!',
          variant: 'default' as const,
          showProgress: true,
        };
      case 'erro':
        return {
          icon: <AlertCircle className="size-5" />,
          label: 'Erro',
          message: 'Ocorreu um erro durante o upload',
          variant: 'destructive' as const,
          showProgress: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={cn('shadow-md', className)}>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'size-10 flex items-center justify-center rounded-full',
                status === 'concluído' && 'bg-green-100 text-green-600 dark:bg-green-900/30',
                status === 'processando' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
                status === 'erro' && 'bg-red-100 text-red-600 dark:bg-red-900/30',
                status === 'aguardando' && 'bg-muted text-muted-foreground'
              )}
            >
              {config.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{config.message}</span>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
              {fileName && (
                <p className="text-muted-foreground text-sm">
                  Arquivo: <span className="font-medium">{fileName}</span>
                </p>
              )}
            </div>
          </div>
          {config.showProgress && (
            <div className="text-muted-foreground text-sm font-medium">{progress}%</div>
          )}
        </div>

        {config.showProgress && (
          <Progress
            value={progress}
            className={cn(
              'h-2',
              status === 'concluído' && '[&>div]:bg-green-600',
              status === 'processando' && '[&>div]:bg-blue-600'
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

export { UploadProgress };
