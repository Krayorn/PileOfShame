/**
 * Builds a full image URL using the CDN URI and the stored path
 * @param path The image path stored in the database
 * @returns The full URL to the image
 */
export function buildImageUrl(path: string): string {
  const cdnUri = import.meta.env.VITE_CDN_URI;
  
  if (!cdnUri) {
    console.warn('VITE_CDN_URI environment variable is not set');
    return path; // Fallback to the path as-is
  }
  
  // Remove any leading slash from the path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Remove trailing slash from CDN URI if present
  const cleanCdnUri = cdnUri.endsWith('/') ? cdnUri.slice(0, -1) : cdnUri;
  
  return `${cleanCdnUri}/${cleanPath}`;
}
