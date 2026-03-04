// CourseCard - course enrollment card with progress
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseEnrollment } from '@/lib/shop/types';

interface CourseCardProps {
  enrollment: CourseEnrollment;
  className?: string;
}

export function CourseCard({ enrollment, className }: CourseCardProps) {
  return (
    <Link to={`/courses/${enrollment.course_id}`}>
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {enrollment.course_image ? (
              <img
                src={enrollment.course_image}
                alt={enrollment.course_name}
                className="h-16 w-24 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="h-16 w-24 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                <GraduationCap className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-medium text-sm line-clamp-1">{enrollment.course_name}</h3>
              <div className="flex items-center gap-2">
                <Progress value={enrollment.progress_percent} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground shrink-0">
                  {Math.round(enrollment.progress_percent).toLocaleString('fa-IR')}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {enrollment.completed_lessons.toLocaleString('fa-IR')} از {enrollment.total_lessons.toLocaleString('fa-IR')} درس
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default CourseCard;
