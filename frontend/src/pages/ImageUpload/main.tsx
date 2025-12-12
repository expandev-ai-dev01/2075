/**
 * @summary
 * Image Upload page component.
 * Orchestrates the complete upload workflow with drag-and-drop interface.
 *
 * @module pages/ImageUpload/main
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/card';
import { Separator } from '@/core/components/separator';
import { Alert, AlertDescription, AlertTitle } from '@/core/components/alert';
import { Info } from 'lucide-react';
import { useImageUpload } from '@/domain/imageUpload/hooks/useImageUpload';
import { ImageUploadZone } from '@/domain/imageUpload/components/ImageUploadZone';
import { UploadProgress } from '@/domain/imageUpload/components/UploadProgress';
import { UploadActions } from '@/domain/imageUpload/components/UploadActions';
import { ResultDisplay } from '@/domain/converter/components/ResultDisplay';

/**
 * Main page for image upload functionality.
 * Handles file selection, upload, and result display.
 */
function ImageUploadPage() {
  const {
    uploadImage,
    resetUpload,
    uploadStatus,
    uploadProgress,
    uploadResult,
    error,
    isUploading,
    canUpload,
  } = useImageUpload();

  const [selectedFile, setSelectedFile] = useState<File>();

  const handleFileSelect = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      await uploadImage(file);
    },
    [uploadImage]
  );

  const handleReset = useCallback(async () => {
    setSelectedFile(undefined);
    await resetUpload();
  }, [resetUpload]);

  const showUploadZone = canUpload;
  const showProgress = uploadStatus !== 'aguardando';
  const showResult = uploadStatus === 'concluído' && uploadResult;
  const showResetButton = uploadStatus === 'concluído' || uploadStatus === 'erro';

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Conversor de Imagem para Base64</h1>
        <p className="text-muted-foreground text-lg">
          Converta suas imagens PNG e JPEG em strings base64
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="size-4" />
        <AlertTitle>Como funciona</AlertTitle>
        <AlertDescription>
          Faça upload de uma imagem PNG ou JPEG (máximo 15MB) e receba a string base64
          correspondente. Você pode copiar o resultado ou baixá-lo como arquivo de texto.
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Upload Section */}
      {showUploadZone && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Upload de Imagem</CardTitle>
            <CardDescription>
              Selecione ou arraste uma imagem para começar a conversão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadZone onFileSelect={handleFileSelect} disabled={isUploading} />
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      {showProgress && (
        <UploadProgress
          status={uploadStatus}
          progress={uploadProgress}
          fileName={selectedFile?.name}
        />
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro no upload</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Result Section */}
      {showResult && uploadResult && (
        <ResultDisplay
          base64Content={uploadResult.fileName}
          fileName={selectedFile?.name}
          fileType={uploadResult.mimeType.split('/')[1]}
          fileSize={uploadResult.fileSize}
          conversionDate={new Date(uploadResult.uploadedAt)}
        />
      )}

      {/* Actions Section */}
      <UploadActions onReset={handleReset} showReset={showResetButton} isResetting={false} />
    </div>
  );
}

export { ImageUploadPage };
