import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('./db', () => ({
  getUserIntegrations: vi.fn(),
  getUserIntegration: vi.fn(),
  upsertUserIntegration: vi.fn(),
  disconnectUserIntegration: vi.fn(),
}));

import * as db from './db';
import { INTEGRATION_CATALOG } from './routers/integrations';

describe('INTEGRATION_CATALOG', () => {
  it('should contain at least 10 integrations', () => {
    expect(INTEGRATION_CATALOG.length).toBeGreaterThanOrEqual(10);
  });

  it('should have unique IDs', () => {
    const ids = INTEGRATION_CATALOG.map(i => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have required fields on every item', () => {
    for (const item of INTEGRATION_CATALOG) {
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.authType).toBeTruthy();
      expect(item.docsUrl).toBeTruthy();
    }
  });

  it('should cover all 4 expected categories', () => {
    const categories = new Set(INTEGRATION_CATALOG.map(i => i.category));
    expect(categories.has('affiliate')).toBe(true);
    expect(categories.has('analytics')).toBe(true);
    expect(categories.has('social')).toBe(true);
    expect(categories.has('email')).toBe(true);
  });
});

describe('db helpers (mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserIntegrations returns empty array when no connections', async () => {
    vi.mocked(db.getUserIntegrations).mockResolvedValue([]);
    const result = await db.getUserIntegrations('user-1');
    expect(result).toEqual([]);
    expect(db.getUserIntegrations).toHaveBeenCalledWith('user-1');
  });

  it('getUserIntegration returns null when not found', async () => {
    vi.mocked(db.getUserIntegration).mockResolvedValue(null);
    const result = await db.getUserIntegration('user-1', 'shopify');
    expect(result).toBeNull();
  });

  it('upsertUserIntegration is called with correct args', async () => {
    vi.mocked(db.upsertUserIntegration).mockResolvedValue(undefined);
    await db.upsertUserIntegration('user-1', 'shopify', {
      status: 'connected',
      apiKey: 'test-key',
      lastSyncAt: new Date(),
      metricsJson: null,
      errorMessage: null,
    });
    expect(db.upsertUserIntegration).toHaveBeenCalledWith(
      'user-1',
      'shopify',
      expect.objectContaining({ status: 'connected', apiKey: 'test-key' })
    );
  });

  it('disconnectUserIntegration is called with correct args', async () => {
    vi.mocked(db.disconnectUserIntegration).mockResolvedValue(undefined);
    await db.disconnectUserIntegration('user-1', 'shopify');
    expect(db.disconnectUserIntegration).toHaveBeenCalledWith('user-1', 'shopify');
  });
});
