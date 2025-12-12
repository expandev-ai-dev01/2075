/**
 * @summary
 * Action buttons for upload management.
 * Provides reset functionality after upload completion.
 *
 * @module domain/imageUpload/components/UploadActions/main
 */

import { RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/core/components/button';
import { cn } from '@/core/lib/utils';
import type { UploadActionsProps } from './types';

/**
 * Component for upload action buttons.
 * Currently provides session reset functionality.
 */
function UploadActions({ onReset, showReset, isResetting = false, className }: UploadActionsProps) {
  if (!showReset) return null;

  return (
    <div className={cn('flex justify-center', className)}>
      <Button
        onClick={onReset}
        disabled={isResetting}
        variant="outline"
        size="lg"
        className="gap-2"
      >
        {isResetting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RotateCcw className="size-4" />
        )}
        {isResetting ? 'Reiniciando...' : 'Iniciar Novo Upload'}
      </Button>
    </div>
  );
}

export { UploadActions };
