// LessonContent - individual lesson display (video, text, quiz)
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/blog/sanitize';
import type { CourseLesson } from '@/lib/shop/types';

interface LessonContentProps {
  lesson: CourseLesson;
  onProgressUpdate?: (seconds: number) => void;
  className?: string;
}

export function LessonContent({ lesson, onProgressUpdate, className }: LessonContentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Track video progress
  useEffect(() => {
    if (lesson.type !== 'video' || !onProgressUpdate) return;

    intervalRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        onProgressUpdate(Math.floor(videoRef.current.currentTime));
      }
    }, 10_000); // Report every 10 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lesson.id, lesson.type, onProgressUpdate]);

  if (lesson.type === 'video' && lesson.video_url) {
    // Check if it's an embed URL (YouTube, Vimeo, etc.)
    const isEmbed = /youtube\.com|youtu\.be|vimeo\.com|aparat\.com/.test(lesson.video_url);

    return (
      <div className={cn('space-y-4', className)}>
        {isEmbed ? (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={lesson.video_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={lesson.video_url}
              controls
              className="w-full h-full"
            />
          </div>
        )}

        {lesson.content && (
          <div
            className="prose prose-sm max-w-none text-muted-foreground leading-8"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
          />
        )}
      </div>
    );
  }

  if (lesson.type === 'text' && lesson.content) {
    return (
      <div
        className={cn('prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-8', className)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
      />
    );
  }

  if (lesson.type === 'quiz' && lesson.content) {
    return (
      <div className={cn('space-y-4', className)}>
        <div
          className="prose prose-sm max-w-none text-muted-foreground leading-8"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }}
        />
      </div>
    );
  }

  return (
    <div className={cn('text-center py-12 text-muted-foreground text-sm', className)}>
      محتوای این درس در دسترس نیست
    </div>
  );
}

export default LessonContent;
