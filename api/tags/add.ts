import { put, BlobPreconditionFailedError } from '@vercel/blob';
import { readTagsWithEtag, TAGS_BLOB_PATHNAME } from './_store.js';
import { sanitizeTagName, MAX_TAG_LENGTH } from './_sanitize.js';
import { isAllowedOrigin, isValidApiKey, getCorsHeaders } from './_auth.js';

const MAX_TAGS_PER_REQUEST = 9999;
const MAX_WRITE_ATTEMPTS = 5;

const TAGS_ENDPOINT_MESSAGE =
  "This API endpoint captures all possible tags found across Chromatix users' libraries, in case " +
  'Chromatix decides to do something with these in future (e.g. generating thumbnails for all tags).';

async function handler(request: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(request, {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  if (!isAllowedOrigin(request) || !isValidApiKey(request, process.env.TAGS_ADD_API_KEY)) {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403, headers: corsHeaders });
  }

  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, error: 'Request body must be valid JSON' },
        { status: 400, headers: corsHeaders }
      );
    }

    const incomingTags = (body as { tags?: unknown })?.tags;

    if (!Array.isArray(incomingTags) || !incomingTags.every((tag) => typeof tag === 'string')) {
      return Response.json(
        { success: false, error: '"tags" must be an array of strings' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (incomingTags.length > MAX_TAGS_PER_REQUEST) {
      return Response.json(
        { success: false, error: `"tags" must contain at most ${MAX_TAGS_PER_REQUEST} entries` },
        { status: 400, headers: corsHeaders }
      );
    }

    let addedCount = 0;

    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt += 1) {
      const { tags: existingTags, etag } = await readTagsWithEtag();
      const existingTagsLower = new Set(existingTags.map((tag) => tag.toLowerCase()));

      const newTags: string[] = [];
      const seenLower = new Set<string>();

      for (const rawTag of incomingTags) {
        const tag = sanitizeTagName(rawTag);
        const tagLower = tag.toLowerCase();

        if (!tag || tag.length > MAX_TAG_LENGTH || existingTagsLower.has(tagLower) || seenLower.has(tagLower)) {
          continue;
        }

        seenLower.add(tagLower);
        newTags.push(tag);
      }

      if (newTags.length === 0) {
        addedCount = 0;
        break;
      }

      const updatedTags = [...existingTags, ...newTags].sort((a, b) => a.localeCompare(b));

      try {
        await put(TAGS_BLOB_PATHNAME, JSON.stringify(updatedTags), {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
          ...(etag && { ifMatch: etag }),
          abortSignal: AbortSignal.timeout(10000),
        });
        addedCount = newTags.length;
        break;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError && attempt < MAX_WRITE_ATTEMPTS - 1) {
          continue;
        }
        throw error;
      }
    }

    return Response.json(
      { success: true, added: addedCount, message: TAGS_ENDPOINT_MESSAGE },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write tags',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export default { fetch: handler };

export const config = { runtime: 'nodejs' };
