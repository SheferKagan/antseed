import test from 'node:test';
import assert from 'node:assert/strict';

import { defaultNetworkStats, parsePeerFromRaw, touchPeer } from './peer-cache.js';

test('defaultNetworkStats returns dashboard offline defaults', () => {
  assert.deepEqual(defaultNetworkStats(), {
    totalPeers: 0,
    dhtNodeCount: 0,
    dhtHealthy: false,
    lastScanAt: null,
    totalLookups: 0,
    successfulLookups: 0,
    lookupSuccessRate: 0,
    averageLookupLatencyMs: 0,
    healthReason: 'dashboard offline',
  });
});

test('parsePeerFromRaw returns null without a peerId', () => {
  assert.equal(parsePeerFromRaw({ publicAddress: '127.0.0.1:9000' }), null);
});

test('parsePeerFromRaw extracts host, port, and provider service names', () => {
  const peer = parsePeerFromRaw({
    peerId: 'peer-1',
    publicAddress: '127.0.0.1:9000',
    providers: [
      { services: ['gpt-4o', 'claude-sonnet'] },
      { services: ['gpt-4o-mini', 123] },
      { services: 'invalid' },
    ],
    defaultInputUsdPerMillion: 1.25,
    defaultOutputUsdPerMillion: '2.5',
    maxConcurrency: 3,
    lastSeen: 123456,
  });

  assert.deepEqual(peer, {
    peerId: 'peer-1',
    host: '127.0.0.1',
    port: 9000,
    providers: ['gpt-4o', 'claude-sonnet', 'gpt-4o-mini'],
    inputUsdPerMillion: 1.25,
    outputUsdPerMillion: 2.5,
    capacityMsgPerHour: 180,
    reputation: 100,
    lastSeen: 123456,
    source: 'dht',
    online: true,
  });
});

test('parsePeerFromRaw keeps IPv6 addresses intact when no numeric port is present', () => {
  const peer = parsePeerFromRaw({
    peerId: 'peer-2',
    publicAddress: '2001:db8::1',
  });

  assert.equal(peer?.host, '2001:db8::1');
  assert.equal(peer?.port, 0);
});

test('parsePeerFromRaw still parses bracketed IPv6 addresses with ports', () => {
  const peer = parsePeerFromRaw({
    peerId: 'peer-3',
    publicAddress: '[2001:db8::1]:8443',
  });

  assert.equal(peer?.host, '[2001:db8::1]');
  assert.equal(peer?.port, 8443);
});

test('touchPeer returns false when the peer is not cached', () => {
  assert.equal(touchPeer('missing-peer'), false);
});
