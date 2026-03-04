// useMyCourses & useCourseContent - course data hooks
import { useState, useEffect, useCallback } from 'react';
import { getMyCourses, getCourseContent, updateCourseProgress } from '@/lib/shop/service';
import type { CourseEnrollment, CourseModule, CourseProgress } from '@/lib/shop/types';

export function useMyCourses() {
  const [courses, setCourses] = useState<CourseEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت دوره‌ها');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { courses, isLoading, error, refresh: fetch };
}

export function useCourseContent(courseId: string | undefined) {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(!!courseId);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCourseContent(courseId);
      setModules(data.modules);
      setProgress(data.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در دریافت محتوای دوره');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetch(); }, [fetch]);

  const completeLesson = useCallback(async (lessonId: string, moduleId: string) => {
    if (!courseId) return;
    await updateCourseProgress(courseId, lessonId, moduleId, true);
    setProgress(prev => {
      const idx = prev.findIndex(p => p.lesson_id === lessonId);
      const entry: CourseProgress = { lesson_id: lessonId, module_id: moduleId, completed: true, updated_at: new Date().toISOString() };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, [courseId]);

  const reportProgress = useCallback(async (lessonId: string, moduleId: string, seconds: number) => {
    if (!courseId) return;
    await updateCourseProgress(courseId, lessonId, moduleId, false, seconds);
  }, [courseId]);

  return { modules, progress, isLoading, error, completeLesson, reportProgress, refresh: fetch };
}
