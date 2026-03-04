// CoursePlayer - module/lesson navigator with progress tracking
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LessonContent } from './LessonContent';
import type { CourseModule, CourseLesson, CourseProgress } from '@/lib/shop/types';

interface CoursePlayerProps {
  modules: CourseModule[];
  progress: CourseProgress[];
  onLessonComplete?: (lessonId: string, moduleId: string) => void;
  onProgressUpdate?: (lessonId: string, moduleId: string, seconds: number) => void;
  className?: string;
}

const LESSON_ICONS: Record<string, React.ElementType> = {
  video: PlayCircle,
  text: FileText,
  quiz: HelpCircle,
};

export function CoursePlayer({ modules, progress, onLessonComplete, onProgressUpdate, className }: CoursePlayerProps) {
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(() => {
    // Find first incomplete lesson
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        const p = progress.find(pr => pr.lesson_id === lesson.id);
        if (!p?.completed) return lesson;
      }
    }
    return modules[0]?.lessons[0] || null;
  });
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (activeLesson) {
      const mod = modules.find(m => m.lessons.some(l => l.id === activeLesson.id));
      if (mod) set.add(mod.id);
    }
    return set;
  });

  const isCompleted = useCallback((lessonId: string) => {
    return progress.some(p => p.lesson_id === lessonId && p.completed);
  }, [progress]);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = progress.filter(p => p.completed).length;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6', className)}>
      {/* Sidebar - Module list */}
      <div className="lg:w-80 shrink-0 space-y-3">
        {/* Progress */}
        <div className="space-y-2 pb-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">پیشرفت کلی</span>
            <span className="font-medium">{Math.round(progressPercent).toLocaleString('fa-IR')}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Separator />

        {/* Modules */}
        <div className="space-y-1">
          {modules.map((mod) => {
            const expanded = expandedModules.has(mod.id);
            const modCompleted = mod.lessons.every(l => isCompleted(l.id));
            const modLessonsDone = mod.lessons.filter(l => isCompleted(l.id)).length;

            return (
              <div key={mod.id}>
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-right"
                >
                  {modCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium line-clamp-1">{mod.title}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {modLessonsDone.toLocaleString('fa-IR')}/{mod.lessons.length.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>

                {expanded && (
                  <div className="mr-4 border-r border-border/50 space-y-0.5 py-1">
                    {mod.lessons.map((lesson) => {
                      const completed = isCompleted(lesson.id);
                      const isActive = activeLesson?.id === lesson.id;
                      const Icon = LESSON_ICONS[lesson.type] || FileText;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className={cn(
                            'w-full flex items-center gap-2 pr-3 pl-2 py-2 rounded-lg text-right text-sm transition-colors',
                            isActive ? 'bg-muted font-medium' : 'hover:bg-muted/50',
                          )}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : (
                            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          <span className="flex-1 line-clamp-1">{lesson.title}</span>
                          {lesson.duration_seconds && (
                            <span className="text-[11px] text-muted-foreground shrink-0">
                              {Math.ceil(lesson.duration_seconds / 60).toLocaleString('fa-IR')} دقیقه
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        {activeLesson ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{activeLesson.title}</h2>
              {!isCompleted(activeLesson.id) && onLessonComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => onLessonComplete(activeLesson.id, activeLesson.module_id)}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  تکمیل درس
                </Button>
              )}
            </div>
            <LessonContent
              lesson={activeLesson}
              onProgressUpdate={onProgressUpdate ? (seconds) => onProgressUpdate(activeLesson.id, activeLesson.module_id, seconds) : undefined}
            />
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            یک درس را از منوی سمت راست انتخاب کنید
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursePlayer;
