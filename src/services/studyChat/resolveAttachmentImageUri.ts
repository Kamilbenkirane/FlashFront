import { buildApiUrl } from '@/services/runtimeConfig';

const URI_SCHEME_PATTERN = /^(?:[a-z][a-z0-9+\-.]*:)?\/\//i;
const SPECIAL_URI_PATTERN = /^(?:data|file|content|asset):/i;

export const resolveAttachmentImageUri = (
  imagePath: string,
  imageDataUrl?: string,
) => {
  const normalizedPath = imagePath.trim();
  const normalizedDataUrl = imageDataUrl?.trim();

  if (normalizedPath) {
    if (
      URI_SCHEME_PATTERN.test(normalizedPath) ||
      SPECIAL_URI_PATTERN.test(normalizedPath)
    ) {
      return normalizedPath;
    }
  }

  if (normalizedDataUrl) {
    return normalizedDataUrl;
  }

  if (normalizedPath) {
    return buildApiUrl(normalizedPath);
  }

  return '';
};
