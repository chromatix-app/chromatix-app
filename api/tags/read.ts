import { readTags } from './_store';
import { isAllowedOrigin, isValidApiKey, getCorsHeaders } from './_auth';

export default async function handler(request: Request): Promise<Response> {
  const corsHeaders = getCorsHeaders(request, {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Api-Key',
  });

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  if (!isAllowedOrigin(request) || !isValidApiKey(request, process.env.TAGS_READ_API_KEY)) {
    return Response.json({ success: false, error: 'Forbidden' }, { status: 403, headers: corsHeaders });
  }

  try {
    const tags = await readTags();

    return Response.json(
      {
        success: true,
        total: tags.length,
        tags,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read tags',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export const config = { runtime: 'edge' };
