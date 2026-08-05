import { list, get } from '@vercel/blob';

export const TAGS_BLOB_PATHNAME = 'tags.json';

/**
 * Reads the current tags array from blob storage, or returns an empty array
 * if the blob does not exist yet.
 */
export async function readTags(): Promise<string[]> {
  const { blobs } = await list({ prefix: TAGS_BLOB_PATHNAME });
  const existing = blobs.find((blob) => blob.pathname === TAGS_BLOB_PATHNAME);

  if (!existing) {
    return [];
  }

  const blob = await get(existing.url, { access: 'private', useCache: false });
  const data = await new Response(blob?.stream).json();

  return Array.isArray(data) ? data : [];
}
