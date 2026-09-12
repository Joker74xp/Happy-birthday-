/**
 * Converts a Google Drive link to direct displayable image URLs.
 */
export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/id=([a-zA-Z0-9_-]+)/) ||
    url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function getDriveImageUrls(url: string): {
  primary: string;
  thumbnail: string;
  fallback: string;
  rawDriveUrl: string;
} {
  const driveId = extractDriveId(url);
  if (!driveId) {
    return {
      primary: url,
      thumbnail: url,
      fallback: url,
      rawDriveUrl: url,
    };
  }

  return {
    primary: `https://lh3.googleusercontent.com/d/${driveId}`,
    thumbnail: `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
    fallback: `https://drive.google.com/uc?export=view&id=${driveId}`,
    rawDriveUrl: `https://drive.google.com/file/d/${driveId}/view?usp=sharing`,
  };
}
