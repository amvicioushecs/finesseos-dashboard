import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';

// vi.mock is hoisted to the top of the file by Vitest.
// All values used inside the factory MUST be defined inline — no external variables.
vi.mock('../db', () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getNodesByUserId: vi.fn().mockResolvedValue([]),
  getNodeById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    slug: 'test-program',
    destination: 'https://example.com/affiliate',
    brandName: 'Test Brand',
    platform: 'General',
    category: 'General',
    status: 'active',
    marketingAngle: 'Test angle',
    commissionRate: '10%',
    complianceStatus: 'compliant',
    complianceRules: [],
    keywords: [],
    personas: [],
    contentIdeas: [],
    targetPlatforms: [],
    ftcDisclosure: 'This post contains affiliate links.',
    notes: 'Test notes',
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createNode: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    slug: 'test-program',
    destination: 'https://example.com/affiliate',
    brandName: 'Test Brand',
    platform: 'General',
    category: 'General',
    status: 'active',
    marketingAngle: 'Test angle',
    commissionRate: '10%',
    complianceStatus: 'compliant',
    complianceRules: [],
    keywords: [],
    personas: [],
    contentIdeas: [],
    targetPlatforms: [],
    ftcDisclosure: 'This post contains affiliate links.',
    notes: 'Test notes',
    assets: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateNodeStatus: vi.fn().mockResolvedValue(undefined),
  deleteNode: vi.fn().mockResolvedValue(undefined),
  createAsset: vi.fn().mockResolvedValue(1),
  getAssetsByNodeId: vi.fn().mockResolvedValue([]),
  deleteAsset: vi.fn().mockResolvedValue('test/test.png'),
  nodeRowToFrontend: vi.fn(),
}));

vi.mock('../storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ key: 'test/test.png', url: 'https://example.com/test.png' }),
}));

vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          slug: 'test-program',
          brandName: 'Test Brand',
          platform: 'General',
          category: 'General',
          commissionRate: '10%',
          marketingAngle: 'Test angle',
          keywords: ['kw1', 'kw2'],
          personas: [{ name: 'Persona 1', age: '25-35', painPoints: ['pain1'], platforms: ['Instagram'], hook: 'hook1' }],
          contentIdeas: ['idea1', 'idea2'],
          targetPlatforms: [{ platform: 'Instagram', fitScore: 90, reason: 'Great fit' }],
          ftcDisclosure: 'This post contains affiliate links.',
          complianceRules: ['Rule 1'],
          complianceStatus: 'compliant',
          notes: 'Test notes',
        })
      }
    }]
  }),
}));

function createAuthContext(userId = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'oauth',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext['res'],
  };
}

describe('nodes router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nodes.list returns empty array for new user', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.nodes.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('nodes.create saves a node and returns it', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.nodes.create({
      brandName: 'Test Brand',
      slug: 'test-program',
      destination: 'https://example.com/affiliate',
      platform: 'General',
      category: 'General',
    });
    expect(result).toBeDefined();
    expect(result.id).toBe(1);
    expect(result.slug).toBe('test-program');
  });

  it('nodes.listAssets returns empty array for node with no assets', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.nodes.listAssets({ nodeId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('nodes.uploadAsset uploads file and returns assetId and url', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.nodes.uploadAsset({
      nodeId: 1,
      filename: 'banner.png',
      mimeType: 'image/png',
      fileSize: 2048,
      assetType: 'image',
      label: 'Banner Image',
      base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('assetId');
    expect(result).toHaveProperty('url');
    expect(result.url).toBe('https://example.com/test.png');
  });

  it('nodes.deleteAsset resolves with success', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.nodes.deleteAsset({ assetId: 1 })).resolves.toEqual({ success: true });
  });
});
