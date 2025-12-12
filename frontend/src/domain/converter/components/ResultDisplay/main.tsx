/**
 * @summary
 * Component for displaying base64 conversion results.
 * Shows the base64 string with metadata and copy/download actions.
 *
 * @module domain/converter/components/ResultDisplay/main
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  Calendar,
  Image,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/card';
import { Button } from '@/core/components/button';
import { Textarea } from '@/core/components/textarea';
import { Badge } from '@/core/components/badge';
import { Separator } from '@/core/components/separator';
import { Alert, AlertDescription, AlertTitle } from '@/core/components/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';
import { toast } from 'sonner';
import { cn } from '@/core/lib/utils';
import { DownloadButton } from '../DownloadButton';
import type { ResultDisplayProps } from './types';

type ViewMode = 'completo' | 'compacto' | 'com_prefixo';
type CopyFormat = 'sem_quebras' | 'com_quebras';

const SIZE_LIMIT_MB = 5;
const SIZE_LIMIT_BYTES = SIZE_LIMIT_MB * 1024 * 1024;

/**
 * Displays base64 conversion results with copy and download functionality.
 * Handles large strings with alternative display modes.
 */
function ResultDisplay({
  base64Content,
  fileName,
  fileType,
  fileSize,
  originalDimensions,
  conversionDate,
  className,
}: ResultDisplayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [viewMode, setViewMode] = useState<ViewMode>('completo');
  const [copyFormat, setCopyFormat] = useState<CopyFormat>('sem_quebras');
  const [showLineBreaks, setShowLineBreaks] = useState(true);

  // Calculate string size
  const stringSize = useMemo(() => {
    const bytes = new Blob([base64Content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }, [base64Content]);

  const isLargeString = useMemo(() => {
    return new Blob([base64Content]).size > SIZE_LIMIT_BYTES;
  }, [base64Content]);

  // Format display content based on view mode
  const displayContent = useMemo(() => {
    let content = base64Content;

    // Apply view mode
    if (viewMode === 'compacto' && base64Content.length > 100) {
      const start = base64Content.slice(0, 50);
      const end = base64Content.slice(-50);
      content = `${start}...${end}`;
    } else if (viewMode === 'com_prefixo' && fileType) {
      const prefix = `data:image/${fileType.toLowerCase()};base64,`;
      content = prefix + base64Content;
    }

    // Apply line breaks for display
    if (showLineBreaks && viewMode !== 'compacto') {
      return content.match(/.{1,76}/g)?.join('\n') || content;
    }

    return content;
  }, [base64Content, viewMode, showLineBreaks, fileType]);

  // Format content for copy based on selected format
  const getCopyContent = useCallback(() => {
    let content = base64Content;

    if (viewMode === 'com_prefixo' && fileType) {
      const prefix = `data:image/${fileType.toLowerCase()};base64,`;
      content = prefix + base64Content;
    }

    if (copyFormat === 'com_quebras') {
      return content.match(/.{1,76}/g)?.join('\n') || content;
    }

    return content;
  }, [base64Content, viewMode, fileType, copyFormat]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      const contentToCopy = getCopyContent();
      await navigator.clipboard.writeText(contentToCopy);
      setCopyStatus('copied');
      toast.success('Copiado!', {
        description: 'String base64 copiada para a área de transferência',
      });
      setTimeout(() => setCopyStatus('idle'), 3000);
    } catch (error) {
      setCopyStatus('error');
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar para a área de transferência',
      });
      setTimeout(() => setCopyStatus('idle'), 3000);
    }
  }, [getCopyContent]);

  // Select all text
  const handleSelectAll = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.select();
      toast.info('Texto selecionado', {
        description: 'Use Ctrl+C (ou Cmd+C) para copiar',
      });
    }
  }, []);

  // Format date
  const formattedDate = conversionDate
    ? format(conversionDate, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
    : format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });

  return (
    <Card className={cn('w-full shadow-lg', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Resultado da Conversão
            </CardTitle>
            <CardDescription>String base64 gerada com sucesso</CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {fileType?.toUpperCase() || 'IMAGEM'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metadata Section */}
        <div className="bg-muted/30 grid gap-3 rounded-lg border p-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="text-muted-foreground size-4" />
            <span className="text-muted-foreground font-medium">Data de conversão:</span>
            <span>{formattedDate}</span>
          </div>

          {fileName && (
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-4" />
              <span className="text-muted-foreground font-medium">Arquivo original:</span>
              <span className="truncate">{fileName}</span>
            </div>
          )}

          {originalDimensions && (
            <div className="flex items-center gap-2">
              <Image className="text-muted-foreground size-4" />
              <span className="text-muted-foreground font-medium">Dimensões:</span>
              <span>{originalDimensions}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <HardDrive className="text-muted-foreground size-4" />
            <span className="text-muted-foreground font-medium">Tamanho da string:</span>
            <span>{stringSize}</span>
          </div>

          {fileSize && (
            <div className="flex items-center gap-2">
              <HardDrive className="text-muted-foreground size-4" />
              <span className="text-muted-foreground font-medium">Tamanho original:</span>
              <span>
                {fileSize < 1024
                  ? `${fileSize} B`
                  : fileSize < 1024 * 1024
                  ? `${(fileSize / 1024).toFixed(2)} KB`
                  : `${(fileSize / (1024 * 1024)).toFixed(2)} MB`}
              </span>
            </div>
          )}
        </div>

        {/* Large String Warning */}
        {isLargeString && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertTitle>String muito grande detectada</AlertTitle>
            <AlertDescription>
              Esta string excede {SIZE_LIMIT_MB}MB. Para melhor desempenho, considere usar o modo
              compacto ou fazer o download direto do arquivo.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Display Options */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Modo de visualização:</span>
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completo">Completo</SelectItem>
                  <SelectItem value="compacto">Compacto</SelectItem>
                  <SelectItem value="com_prefixo">Com prefixo Data URI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Formato de cópia:</span>
              <Select
                value={copyFormat}
                onValueChange={(value) => setCopyFormat(value as CopyFormat)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_quebras">Sem quebras de linha</SelectItem>
                  <SelectItem value="com_quebras">Com quebras de linha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLineBreaks(!showLineBreaks)}
              className="ml-auto"
            >
              {showLineBreaks ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showLineBreaks ? 'Ocultar quebras' : 'Mostrar quebras'}
            </Button>
          </div>

          {/* Base64 Display */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={displayContent}
              readOnly
              className="min-h-[200px] resize-y font-mono text-xs"
              placeholder="String base64 aparecerá aqui..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCopy}
            disabled={!base64Content}
            variant={copyStatus === 'error' ? 'destructive' : 'default'}
            className={cn(
              'transition-all duration-200',
              copyStatus === 'copied' &&
                'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
            )}
          >
            {copyStatus === 'copied' ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copyStatus === 'copied'
              ? 'Copiado!'
              : copyStatus === 'error'
              ? 'Erro ao copiar'
              : 'Copiar'}
          </Button>

          <Button onClick={handleSelectAll} disabled={!base64Content} variant="outline">
            <FileText className="size-4" />
            Selecionar Tudo
          </Button>

          <DownloadButton
            base64Content={base64Content}
            fileName={fileName}
            fileType={fileType}
            disabled={!base64Content}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export { ResultDisplay };
