export function getProductImageUrl(image: unknown): string | undefined {
  if (typeof image === 'string') return image;
  if (!image || typeof image !== 'object') return undefined;

  const url = (image as { url?: unknown }).url;
  return typeof url === 'string' ? url : undefined;
}

export function getProductImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return [];

  return images
    .map(getProductImageUrl)
    .filter((url): url is string => Boolean(url));
}
