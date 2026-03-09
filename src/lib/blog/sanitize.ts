// HTML Sanitization for blog content using DOMPurify
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i',
  'code', 'pre', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'br', 'hr', 'figure', 'figcaption', 'span', 'div', 'sup', 'sub',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
  'width', 'height', 'loading',
];

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function addHeadingIds(html: string): string {
  let counter = 0;
  return html.replace(/<(h[2-4])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `heading-${counter++}`;
    if (attrs.includes('id=')) return match;
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
}

export function processContent(html: string): string {
  const sanitized = sanitizeHtml(html);
  return addHeadingIds(sanitized);
}
