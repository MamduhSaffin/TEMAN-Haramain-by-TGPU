import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { channelTable, familyStorageConfigured, hashToken, randomId } from '../storage.js';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
};

export async function familyPair(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  if (!familyStorageConfigured()) {
    return { status: 503, headers: NO_STORE_HEADERS, jsonBody: { ok: false, configurationRequired: true, message: 'Family cloud storage is not configured.' } };
  }

  const familyId = randomId(12);
  const writeToken = randomId(24);
  const viewerToken = randomId(24);
  const table = await channelTable();

  await table.createEntity({
    partitionKey: 'channel',
    rowKey: familyId,
    writeTokenHash: hashToken(writeToken),
    viewerTokenHash: hashToken(viewerToken),
    createdAt: Date.now(),
  });

  return { status: 201, headers: NO_STORE_HEADERS, jsonBody: { ok: true, familyId, writeToken, viewerToken } };
}

app.http('familyPair', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'family/pair',
  handler: familyPair,
});
