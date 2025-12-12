/**
 * @summary
 * Drag-and-drop zone for image upload.
 * Provides visual feedback and file validation.
 *
 * @module domain/imageUpload/components/ImageUploadZone/main
 */

import { useCallback, useState, useRef } from 'react';
import { Upload, Image, AlertCircle } from 'lucide-react';
import { cn } from '@/core/lib/utils';
import { Button } from '@/core/components/button';
import { Alert, AlertDescription } from '@/core/components/alert';
import { toast } from 'sonner';
import type { ImageUploadZoneProps } from './types';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

/**
 * Component for uploading images via drag-and-drop or file selection.
 * Validates file type and size before accepting.
 */
function ImageUploadZone({ onFileSelect, disabled = false, className }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'O arquivo selecionado não é uma imagem PNG ou JPEG válida';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'O arquivo excede o limite de 15MB';
    }

    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setValidationError(undefined);

      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        toast.error('Arquivo inválido', { description: error });
        return;
      }

      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
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

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);

      if (files.length === 0) {
        setValidationError('Nenhum arquivo foi selecionado');
        toast.error('Nenhum arquivo', { description: 'Nenhum arquivo foi selecionado' });
        return;
      }

      if (files.length > 1) {
        setValidationError('Por favor, selecione apenas um arquivo por vez');
        toast.error('Múltiplos arquivos', {
          description: 'Por favor, selecione apenas um arquivo por vez',
        });
        return;
      }

      handleFile(files[0]);
    },
    [disabled, handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (files.length > 1) {
        setValidationError('Por favor, selecione apenas um arquivo por vez');
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

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-200',
          isDragging && !disabled
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer'
        )}
      >
        <div
          className={cn(
            'size-20 flex items-center justify-center rounded-full transition-all duration-200',
            isDragging && !disabled ? 'bg-primary/20' : 'bg-muted'
          )}
        >
          {isDragging ? (
            <Upload className="size-10 text-primary animate-bounce" />
          ) : (
            <Image className="text-muted-foreground size-10" />
          )}
        </div>

        <div className="space-y-2 text-center">
          <h3 className="text-lg font-semibold">
            {isDragging ? 'Solte o arquivo aqui' : 'Arraste e solte sua imagem'}
          </h3>
          <p className="text-muted-foreground text-sm">ou clique no botão abaixo para selecionar</p>
        </div>

        <Button
          onClick={handleButtonClick}
          disabled={disabled}
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
          disabled={disabled}
          className="hidden"
          aria-label="Selecionar arquivo de imagem"
        />

        <div className="text-muted-foreground mt-4 space-y-1 text-center text-xs">
          <p>Formatos aceitos: PNG, JPEG</p>
          <p>Tamanho máximo: 15MB</p>
          <p>Apenas um arquivo por vez</p>
        </div>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export { ImageUploadZone };
