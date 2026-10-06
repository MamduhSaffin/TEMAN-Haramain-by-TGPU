import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { channelTable, familyStorageConfigured, safeText, statusTable, tokenMatches } from '../storage.js';

const ALLOWED = new Set(['safe', 'with-group', 'at-hotel', 'need-contact']);

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
};

function jsonResponse(status: number, jsonBody: unknown): HttpResponseInit {
  return { status, headers: NO_STORE_HEADERS, jsonBody };
}

type Body = {
  familyId?: string;
  writeToken?: string;
  checkIn?: {
    id?: string;
    status?: string;
    label?: string;
    createdAt?: number;
    pilgrimName?: string;
    hotelName?: string;
    groupCode?: string;
    busNumber?: string;
  };
};

export async function familyCheckIn(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  if (!familyStorageConfigured()) return jsonResponse(503, { ok: false, configurationRequired: true });

  const body = await request.json() as Body;
  const familyId = safeText(body.familyId, 64);
  const writeToken = safeText(body.writeToken, 128);
  const checkIn = body.checkIn;
  if (!familyId || !writeToken || !checkIn || !ALLOWED.has(checkIn.status || '')) {
    return jsonResponse(400, { ok: false, message: 'Invalid check-in payload.' });
  }

  try {
    const channels = await channelTable();
    const channel = await channels.getEntity<{ writeTokenHash: string }>('channel', familyId);
    if (!tokenMatches(writeToken, String(channel.writeTokenHash || ''))) return jsonResponse(403, { ok: false, message: 'Invalid Family Link credentials.' });
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404) return jsonResponse(404, { ok: false, message: 'Family Link not found.' });
    throw error;
  }

  const createdAt = Number.isFinite(checkIn.createdAt) ? Number(checkIn.createdAt) : Date.now();
  const statuses = await statusTable();
  await statuses.upsertEntity({
    partitionKey: 'status',
    rowKey: familyId,
    checkInId: safeText(checkIn.id, 80),
    status: safeText(checkIn.status, 40),
    label: safeText(checkIn.label, 120),
    createdAt,
    pilgrimName: safeText(checkIn.pilgrimName, 120),
    hotelName: safeText(checkIn.hotelName, 160),
    groupCode: safeText(checkIn.groupCode, 80),
    busNumber: safeText(checkIn.busNumber, 80),
    updatedAt: Date.now(),
  }, 'Replace');

  return jsonResponse(200, { ok: true, syncedAt: Date.now() });
}

app.http('familyCheckIn', {
  methods: ['POST'], authLevel: 'anonymous', route: 'family/checkin', handler: familyCheckIn,
});
