// ImageLightbox - fullscreen image viewer with navigation
import { useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, open, onOpenChange, onIndexChange }: ImageLightboxProps) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(currentIndex + 1);
  }, [hasNext, currentIndex, onIndexChange]);

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(currentIndex - 1);
  }, [hasPrev, currentIndex, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goNext(); // RTL: left = next
      if (e.key === 'ArrowRight') goPrev(); // RTL: right = prev
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, goNext, goPrev, onOpenChange]);

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black/95 border-none [&>button]:hidden">
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation */}
          {hasPrev && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={goPrev}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={goNext}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Image */}
          <img
            src={images[currentIndex]}
            alt=""
            className="max-h-[80vh] max-w-full object-contain"
          />

          {/* Counter */}
          {images.length > 1 && (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageLightbox;
