// CoursePage - course player with sidebar + content area
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { CoursePlayer } from '@/components/shop/courses/CoursePlayer';
import { useCourseContent } from '@/hooks/use-courses';

function CourseContent() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { modules, progress, isLoading, error, completeLesson, reportProgress } = useCourseContent(courseId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-6">
            <Skeleton className="w-80 h-96 hidden lg:block" />
            <Skeleton className="flex-1 h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            بازگشت به پنل
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <title>دوره آموزشی</title>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate('/dashboard')}>
              <ChevronRight className="h-4 w-4" />
              بازگشت به پنل
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <CoursePlayer
          modules={modules}
          progress={progress}
          onLessonComplete={completeLesson}
          onProgressUpdate={reportProgress}
        />
      </main>
    </div>
  );
}

export default function CoursePage() {
  return (
    <AuthGuard>
      <CourseContent />
    </AuthGuard>
  );
}
