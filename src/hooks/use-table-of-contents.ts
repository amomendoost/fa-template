// useTableOfContents - extract headings and track active heading
import { useState, useEffect, useMemo } from 'react';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function useTableOfContents(html?: string) {
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => {
    if (!html) return [];
    const result: TocHeading[] = [];
    const regex = /<(h[2-4])[^>]*id="([^"]*)"[^>]*>(.*?)<\/\1>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const level = parseInt(match[1][1]);
      const id = match[2];
      const text = match[3].replace(/<[^>]*>/g, '').trim();
      result.push({ id, text, level });
    }
    return result;
  }, [html]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return { headings, activeId };
}
