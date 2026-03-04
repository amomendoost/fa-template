// DownloadButton - download file with remaining count
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadButtonProps {
  fileName: string;
  sizeBytes?: number;
  downloadCount: number;
  maxDownloads?: number;
  onDownload: () => Promise<{ download_url: string }>;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DownloadButton({ fileName, sizeBytes, downloadCount, maxDownloads, onDownload, className }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const exhausted = maxDownloads !== undefined && downloadCount >= maxDownloads;

  const handleDownload = async () => {
    if (exhausted || loading) return;
    setLoading(true);
    try {
      const { download_url } = await onDownload();
      window.open(download_url, '_blank');
    } catch {
      // Error handling done by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-muted/30', className)}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{fileName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {sizeBytes && <span>{formatSize(sizeBytes)}</span>}
          {maxDownloads !== undefined && (
            <span>
              {downloadCount.toLocaleString('fa-IR')}/{maxDownloads.toLocaleString('fa-IR')} دانلود
            </span>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 shrink-0"
        onClick={handleDownload}
        disabled={exhausted || loading}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {exhausted ? 'پایان دانلود' : 'دانلود'}
      </Button>
    </div>
  );
}

export default DownloadButton;
