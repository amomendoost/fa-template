// ReadingProgress - thin progress bar at top of page
import { useReadingProgress } from '@/hooks/use-reading-progress';

export function ReadingProgress() {
  const progress = useReadingProgress();

  if (progress <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default ReadingProgress;
