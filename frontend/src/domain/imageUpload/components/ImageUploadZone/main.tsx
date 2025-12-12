/**
 * @summary
 * Drag-and-drop zone for image upload with comprehensive validation.
 * Provides visual feedback and multi-stage file validation.
 *
 * @module domain/imageUpload/components/ImageUploadZone/main
 */

import { useCallback, useState, useRef } from 'react';
import { Upload, Image, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/core/components/button';
import { Alert, AlertDescription, AlertTitle } from '@/core/components/alert';
import { Progress } from '@/core/components/progress';
import { toast } from 'sonner';
import { validateImageFile } from '../../utils/validateImageFile';
import type { ImageUploadZoneProps } from './types';
import type { ValidationError } from '../../types/models';

/**
 * Component for uploading images via drag-and-drop or file selection.
 * Performs comprehensive validation before accepting files.
 */
function ImageUploadZone({ onFileSelect, disabled = false, className }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleValidation = useCallback(async (file: File) => {
    setValidationErrors([]);
    setIsValidating(true);
    setValidationProgress(0);

    try {
      // Simulate progress for better UX
      setValidationProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 100));

      setValidationProgress(40);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Perform actual validation
      const result = await validateImageFile(file);

      setValidationProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 100));

      setValidationProgress(100);

      if (!result.isValid) {
        setValidationErrors(result.errors);
        toast.error('Arquivo inválido', {
          description: result.errors[0]?.message || 'O arquivo não passou na validação',
        });
        return false;
      }

      toast.success('Arquivo válido', {
        description: 'O arquivo passou em todas as validações',
      });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setValidationErrors([
        {
          type: 'integrity',
          message: errorMessage,
        },
      ]);
      toast.error('Erro na validação', { description: errorMessage });
      return false;
    } finally {
      setIsValidating(false);
      setTimeout(() => setValidationProgress(0), 1000);
    }
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const isValid = await handleValidation(file);
      if (isValid) {
        onFileSelect(file);
      }
    },
    [handleValidation, onFileSelect]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isValidating) {
        setIsDragging(true);
      }
    },
    [disabled, isValidating]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isValidating) return;

      const files = Array.from(e.dataTransfer.files);

      if (files.length === 0) {
        setValidationErrors([
          {
            type: 'integrity',
            message: 'Nenhum arquivo foi selecionado',
          },
        ]);
        toast.error('Nenhum arquivo', { description: 'Nenhum arquivo foi selecionado' });
        return;
      }

      if (files.length > 1) {
        setValidationErrors([
          {
            type: 'integrity',
            message: 'Por favor, selecione apenas um arquivo por vez',
          },
        ]);
        toast.error('Múltiplos arquivos', {
          description: 'Por favor, selecione apenas um arquivo por vez',
        });
        return;
      }

      handleFile(files[0]);
    },
    [disabled, isValidating, handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (files.length > 1) {
        setValidationErrors([
          {
            type: 'integrity',
            message: 'Por favor, selecione apenas um arquivo por vez',
          },
        ]);
        toast.error('Múltiplos arquivos', {
          description: 'Por favor, selecione apenas um arquivo por vez',
        });
        return;
      }

      handleFile(files[0]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFile]
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isDisabled = disabled || isValidating;

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-200',
          isDragging && !isDisabled
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
          isDisabled && 'cursor-not-allowed opacity-50',
          !isDisabled && 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            'size-20 flex items-center justify-center rounded-full transition-all duration-200',
            isDragging && !isDisabled
              ? 'bg-primary/20'
              : isValidating
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-muted'
          )}
        >
          {isValidating ? (
            <Loader2 className="size-10 animate-spin text-blue-600" />
          ) : isDragging ? (
            <Upload className="size-10 text-primary animate-bounce" />
          ) : (
            <Image className="text-muted-foreground size-10" />
          )}
        </div>

        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">
            {isValidating
              ? 'Validando arquivo...'
              : isDragging
              ? 'Solte o arquivo aqui'
              : 'Arraste e solte sua imagem'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isValidating
              ? 'Verificando formato e integridade'
              : 'ou clique no botão abaixo para selecionar'}
          </p>
        </div>

        {isValidating && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={validationProgress} className="h-2" />
            <p className="text-muted-foreground text-center text-xs">
              {validationProgress < 40
                ? 'Verificando tamanho e extensão...'
                : validationProgress < 80
                ? 'Validando formato do arquivo...'
                : 'Verificando integridade da imagem...'}
            </p>
          </div>
        )}

        {!isValidating && (
          <>
            <Button
              onClick={handleButtonClick}
              disabled={isDisabled}
              variant="outline"
              size="lg"
              className="mt-4"
            >
              <Upload className="size-4" />
              Selecionar arquivo
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileInputChange}
              disabled={isDisabled}
              className="hidden"
              aria-label="Selecionar arquivo de imagem"
            />

            <div className="text-muted-foreground mt-4 space-y-1 text-center text-xs">
              <p>Formatos aceitos: PNG, JPEG</p>
              <p>Tamanho máximo: 15MB</p>
              <p>Apenas um arquivo por vez</p>
            </div>
          </>
        )}
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Erro de validação</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  • {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {isValidating && (
        <Alert>
          <Loader2 className="size-4 animate-spin" />
          <AlertTitle>Validação em andamento</AlertTitle>
          <AlertDescription>
            Verificando o arquivo em múltiplas etapas para garantir segurança e compatibilidade.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export { ImageUploadZone };
