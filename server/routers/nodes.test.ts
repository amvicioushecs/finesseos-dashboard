import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';

// vi.mock is hoisted to the top of the file by Vitest.
// All values used inside the factory MUST be defined inline — no external variables.
vi.mock('../_core/providers', () => ({
  authProvider: {
    authenticate: vi.fn(),
  },
  dataProvider: {
    getNodesByUserId: vi.fn().mockResolvedValue([]),
    getNodeById: vi.fn().mockResolvedValue({
      id: 'node-1',
      userId: 'user-1',
      brandName: 'Test Brand',
      slug: 'test-program',
      destination: 'https://example.com/affiliate',
      platform: 'General',
      category: 'General',
      status: 'active',
      clicks: '0',
      clickCount: 0,
      earnings: '$0',
      commission: '10%',
      createdAt: '2024-01-01',
      compliance: { status: 'passed', rules: [], disclosure: '', ftcNotes: '' },
      intelligence: { keywordResearch: [], personas: [], marketingAngle: '', contentSuggestions: [], targetPlatforms: [], strategyNotes: '' },
      assets: [],
    }),
    createNode: vi.fn().mockResolvedValue('node-1'),
    updateNodeStatus: vi.fn().mockResolvedValue(undefined),
    deleteNode: vi.fn().mockResolvedValue(undefined),
    createAsset: vi.fn().mockResolvedValue('asset-1'),
    getAssetsByNodeId: vi.fn().mockResolvedValue([]),
    deleteAsset: vi.fn().mockResolvedValue('test/test.png'),
    createAction: vi.fn().mockResolvedValue('action-1'),
  }
}));

vi.mock('../db', () => ({
  getDb: vi.fn().mockResolvedValue(null),
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
          commission: '10%',
          marketingAngle: 'Test angle',
          keywordResearch: ['kw1', 'kw2'],
          personas: [{ name: 'Persona 1', pain: 'pain1', hook: 'hook1', platform: 'Instagram' }],
          contentSuggestions: ['idea1', 'idea2'],
          targetPlatforms: ['Instagram'],
          disclosure: 'This post contains affiliate links.',
          complianceRules: ['Rule 1'],
          complianceStatus: 'passed',
          strategyNotes: 'Test notes',
        })
      }
    }]
  }),
}));

function createAuthContext(userId = 'user-1'): TrpcContext {
  return {
    user: {
      id: userId,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'supabase',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: 'https', headers: {} } as TrpcContext['req'],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext['res'],
    supabase: {
      auth: {
        signOut: async () => ({ error: null }),
      }
    } as any,
    session: {} as any,
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
    // @ts-ignore - Mocked data structure
    const result = await caller.nodes.create({
      brandName: 'Test Brand',
      slug: 'test-program',
      destination: 'https://example.com/affiliate',
      platform: 'General',
      category: 'General',
      status: 'active',
      clicks: '0',
      earnings: '$0',
      commission: '10%',
      complianceDisclosure: 'disclosure',
      complianceRules: [],
      complianceStatus: 'passed',
      complianceFtcNotes: 'notes',
      keywordResearch: [],
      marketingAngle: 'angle',
      personas: [],
      contentSuggestions: [],
      targetPlatforms: [],
      strategyNotes: 'notes',
    });
    expect(result).toBeDefined();
    expect(result.id).toBe('node-1');
    expect(result.slug).toBe('test-program');
  });

  it('nodes.listAssets returns empty array for node with no assets', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.nodes.listAssets({ nodeId: 'node-1' });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('nodes.uploadAsset uploads file and returns assetId and url', async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.nodes.uploadAsset({
      nodeId: 'node-1',
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
    await expect(caller.nodes.deleteAsset({ assetId: 'asset-1' })).resolves.toEqual({ success: true });
  });
});
