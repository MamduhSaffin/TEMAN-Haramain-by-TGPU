import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { channelTable, familyStorageConfigured, safeText, statusTable, tokenMatches } from '../storage.js';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
};

function jsonResponse(status: number, jsonBody: unknown): HttpResponseInit {
  return { status, headers: NO_STORE_HEADERS, jsonBody };
}

export async function familyStatus(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  if (!familyStorageConfigured()) return jsonResponse(503, { ok: false, configurationRequired: true });

  const familyId = safeText(request.query.get('family'), 64);
  const viewerToken = safeText(request.headers.get('x-teman-viewer-token') || request.query.get('token'), 128);
  if (!familyId || !viewerToken) return jsonResponse(400, { ok: false, message: 'Missing Family Link credentials.' });

  try {
    const channels = await channelTable();
    const channel = await channels.getEntity<{ viewerTokenHash: string }>('channel', familyId);
    if (!tokenMatches(viewerToken, String(channel.viewerTokenHash || ''))) return jsonResponse(403, { ok: false, message: 'Invalid Family Link credentials.' });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404) return jsonResponse(404, { ok: false, message: 'Family Link not found.' });
    throw error;
  }

  try {
    const statuses = await statusTable();
    const entity = await statuses.getEntity<Record<string, unknown>>('status', familyId);
    return jsonResponse(200, {
      ok: true,
      latest: {
        id: String(entity.checkInId || ''), status: String(entity.status || ''), label: String(entity.label || ''),
        createdAt: Number(entity.createdAt || 0), pilgrimName: String(entity.pilgrimName || ''),
        hotelName: String(entity.hotelName || ''), groupCode: String(entity.groupCode || ''), busNumber: String(entity.busNumber || ''),
      },
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404) return jsonResponse(200, { ok: true, latest: null });
    throw error;
  }
}

app.http('familyStatus', {
  methods: ['GET'], authLevel: 'anonymous', route: 'family/status', handler: familyStatus,
});
