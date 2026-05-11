import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, affiliateNodes, nodeAssets, userIntegrations, actionFeed, systemMetrics } from "../../../drizzle/schema.pg";
import { PROVIDER_CONFIG } from "./config";
import type { IDataProvider } from "./types";
import type { User, InsertUser, InsertNodeAsset } from "../../../drizzle/schema"; // Use common types if possible, or adapt
import type { FrontendNode, FrontendIntegration } from "../../db";

export class SupabaseDataProvider implements IDataProvider {
  private _db: any;

  constructor() {
    if (PROVIDER_CONFIG.database.url) {
      const client = postgres(PROVIDER_CONFIG.database.url);
      this._db = drizzle(client);
    }
  }

  private async getDb() {
    if (!this._db) {
      throw new Error("Supabase Database not configured");
    }
    return this._db;
  }

  // ─── User operations ────────────────────────────────────────────────────────

  async getUserByOpenId(openId: string): Promise<any | undefined> {
    const db = await this.getDb();
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async upsertUser(user: any): Promise<void> {
    const db = await this.getDb();
    const values = {
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? 'user',
      lastSignedIn: user.lastSignedIn ?? new Date(),
    };

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: {
        name: values.name,
        email: values.email,
        loginMethod: values.loginMethod,
        role: values.role,
        lastSignedIn: values.lastSignedIn,
        updatedAt: new Date(),
      },
    });
  }

  // ─── Affiliate Node operations ───────────────────────────────────────────────────

  async getNodesByUserId(userId: number): Promise<FrontendNode[]> {
    const db = await this.getDb();
    const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.userId, userId)).orderBy(desc(affiliateNodes.createdAt));
    
    // Fetch assets for all nodes
    const allAssets = await db.select().from(nodeAssets).where(eq(nodeAssets.userId, userId));
    
    return rows.map((row: any) => {
      const rowAssets = allAssets.filter((a: any) => a.nodeId === row.id);
      return this.rowToFrontendNode(row, rowAssets);
    });
  }

  async getNodeById(nodeId: number, userId: number): Promise<FrontendNode | null> {
    const db = await this.getDb();
    const rows = await db.select().from(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId))).limit(1);
    if (rows.length === 0) return null;
    
    const assets = await db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
    return this.rowToFrontendNode(rows[0], assets);
  }

  async createNode(userId: number, data: any): Promise<number> {
    const db = await this.getDb();
    const trackingId = Math.random().toString(36).slice(2, 10);
    
    const [result] = await db.insert(affiliateNodes).values({
      userId,
      brandName: data.brandName,
      slug: data.slug,
      destination: data.destination,
      platform: data.platform,
      category: data.category,
      status: data.status,
      clicks: data.clicks,
      earnings: data.earnings,
      commission: data.commission,
      trackingId,
      complianceDisclosure: data.complianceDisclosure,
      complianceRules: data.complianceRules, // jsonb handles array
      complianceStatus: data.complianceStatus,
      complianceFtcNotes: data.complianceFtcNotes,
      keywordResearch: data.keywordResearch,
      marketingAngle: data.marketingAngle,
      personas: data.personas,
      contentSuggestions: data.contentSuggestions,
      targetPlatforms: data.targetPlatforms,
      strategyNotes: data.strategyNotes,
      brandLogoUrl: data.brandLogoUrl,
      brandIconUrl: data.brandIconUrl,
      brandPrimaryColor: data.brandPrimaryColor,
      brandColors: data.brandColors,
      brandDescription: data.brandDescription,
      brandIndustry: data.brandIndustry,
      brandDomain: data.brandDomain,
    }).returning({ id: affiliateNodes.id });
    
    return result.id;
  }

  async deleteNode(nodeId: number, userId: number): Promise<void> {
    const db = await this.getDb();
    await db.delete(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId)));
    await db.delete(affiliateNodes).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
  }

  async updateNodeStatus(nodeId: number, userId: number, status: 'active' | 'paused' | 'alert'): Promise<void> {
    const db = await this.getDb();
    await db.update(affiliateNodes).set({ status, updatedAt: new Date() }).where(and(eq(affiliateNodes.id, nodeId), eq(affiliateNodes.userId, userId)));
  }

  async getNodeByTrackingId(trackingId: string): Promise<any | null> {
    const db = await this.getDb();
    const rows = await db.select().from(affiliateNodes).where(eq(affiliateNodes.trackingId, trackingId)).limit(1);
    return rows.length > 0 ? rows[0] : null;
  }

  async incrementNodeClickCount(nodeId: number): Promise<void> {
    const db = await this.getDb();
    const rows = await db.select({ clickCount: affiliateNodes.clickCount }).from(affiliateNodes).where(eq(affiliateNodes.id, nodeId)).limit(1);
    if (rows.length === 0) return;
    
    const newCount = (rows[0].clickCount ?? 0) + 1;
    const displayClicks = newCount >= 1000 ? `${(newCount / 1000).toFixed(1)}k` : String(newCount);
    
    await db.update(affiliateNodes).set({ 
      clickCount: newCount, 
      clicks: displayClicks,
      updatedAt: new Date()
    }).where(eq(affiliateNodes.id, nodeId));
  }

  // ─── Asset operations ────────────────────────────────────────────────────────────

  async getAssetsByNodeId(nodeId: number, userId: number): Promise<any[]> {
    const db = await this.getDb();
    return db.select().from(nodeAssets).where(and(eq(nodeAssets.nodeId, nodeId), eq(nodeAssets.userId, userId))).orderBy(desc(nodeAssets.createdAt));
  }

  async createAsset(data: any): Promise<number> {
    const db = await this.getDb();
    const [result] = await db.insert(nodeAssets).values({
      nodeId: data.nodeId,
      userId: data.userId,
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      s3Key: data.s3Key,
      url: data.url,
      assetType: data.assetType,
      label: data.label,
    }).returning({ id: nodeAssets.id });
    return result.id;
  }

  async deleteAsset(assetId: number, userId: number): Promise<string> {
    const db = await this.getDb();
    const rows = await db.select().from(nodeAssets).where(and(eq(nodeAssets.id, assetId), eq(nodeAssets.userId, userId))).limit(1);
    if (rows.length === 0) throw new Error("Asset not found");
    await db.delete(nodeAssets).where(eq(nodeAssets.id, assetId));
    return rows[0].s3Key;
  }

  // ─── User Integration operations ─────────────────────────────────────────────────

  async getUserIntegrations(userId: number): Promise<FrontendIntegration[]> {
    const db = await this.getDb();
    const rows = await db.select().from(userIntegrations).where(eq(userIntegrations.userId, userId));
    return rows.map(this.rowToFrontendIntegration);
  }

  async getUserIntegration(userId: number, integrationId: string): Promise<FrontendIntegration | null> {
    const db = await this.getDb();
    const rows = await db.select().from(userIntegrations)
      .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)))
      .limit(1);
    return rows.length > 0 ? this.rowToFrontendIntegration(rows[0]) : null;
  }

  async upsertUserIntegration(userId: number, integrationId: string, data: any): Promise<void> {
    const db = await this.getDb();
    const values = {
      userId,
      integrationId,
      status: data.status,
      apiKey: data.apiKey ?? null,
      metadataJson: data.metadataJson ?? null,
      lastSyncAt: data.lastSyncAt ?? null,
      metricsJson: data.metricsJson ?? null,
      errorMessage: data.errorMessage ?? null,
    };

    await db.insert(userIntegrations).values(values).onConflictDoUpdate({
      target: [userIntegrations.userId, userIntegrations.integrationId],
      set: {
        status: values.status,
        apiKey: values.apiKey,
        metadataJson: values.metadataJson,
        lastSyncAt: values.lastSyncAt,
        metricsJson: values.metricsJson,
        errorMessage: values.errorMessage,
        updatedAt: new Date(),
      },
    });
  }

  async disconnectUserIntegration(userId: number, integrationId: string): Promise<void> {
    const db = await this.getDb();
    await db.update(userIntegrations)
      .set({ 
        status: 'disconnected', 
        apiKey: null, 
        metadataJson: null, 
        lastSyncAt: null, 
        metricsJson: null, 
        errorMessage: null,
        updatedAt: new Date()
      })
      .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.integrationId, integrationId)));
  }

  // ─── Action Feed operations ──────────────────────────────────────────────────

  async createAction(userId: number, data: { type: string; title: string; message: string; metadataJson?: any }): Promise<number> {
    const db = await this.getDb();
    const [result] = await db.insert(actionFeed).values({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadataJson: data.metadataJson ?? null,
    }).returning({ id: actionFeed.id });
    return result.id;
  }

  async getActions(userId: number, limit: number = 20): Promise<any[]> {
    const db = await this.getDb();
    return db.select()
      .from(actionFeed)
      .where(eq(actionFeed.userId, userId))
      .orderBy(desc(actionFeed.createdAt))
      .limit(limit);
  }

  // ─── System Metrics operations ───────────────────────────────────────────────

  async updateSystemMetric(userId: number, data: { name: string; value: string; unit?: string; category?: string }): Promise<void> {
    const db = await this.getDb();
    await db.insert(systemMetrics).values({
      userId,
      name: data.name,
      value: data.value,
      unit: data.unit ?? null,
      category: data.category ?? 'general',
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: [systemMetrics.userId, systemMetrics.name],
      set: {
        value: data.value,
        unit: data.unit ?? null,
        category: data.category ?? 'general',
        updatedAt: new Date(),
      },
    });
  }

  async getSystemMetrics(userId: number): Promise<any[]> {
    const db = await this.getDb();
    return db.select()
      .from(systemMetrics)
      .where(eq(systemMetrics.userId, userId))
      .orderBy(desc(systemMetrics.updatedAt));
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private rowToFrontendNode(row: any, assets: any[] = []): FrontendNode {
    return {
      id: String(row.id),
      brandName: row.brandName,
      slug: row.slug,
      destination: row.destination,
      platform: row.platform,
      category: row.category,
      status: row.status as any,
      clicks: row.clicks,
      clickCount: row.clickCount ?? 0,
      trackingId: row.trackingId ?? null,
      earnings: row.earnings,
      commission: row.commission,
      createdAt: row.createdAt.toISOString().split('T')[0],
      brandLogoUrl: row.brandLogoUrl ?? null,
      brandIconUrl: row.brandIconUrl ?? null,
      brandPrimaryColor: row.brandPrimaryColor ?? null,
      brandColors: (row.brandColors as string[]) ?? [],
      brandDescription: row.brandDescription ?? null,
      brandIndustry: row.brandIndustry ?? null,
      brandDomain: row.brandDomain ?? null,
      compliance: {
        disclosure: row.complianceDisclosure ?? '',
        rules: (row.complianceRules as string[]) ?? [],
        status: row.complianceStatus as any,
        lastChecked: row.updatedAt.toISOString().split('T')[0],
        ftcNotes: row.complianceFtcNotes ?? 'AI compliance scan complete.',
      },
      intelligence: {
        keywordResearch: (row.keywordResearch as string[]) ?? [],
        marketingAngle: row.marketingAngle ?? '',
        personas: (row.personas as any[]) ?? [],
        contentSuggestions: (row.contentSuggestions as string[]) ?? [],
        targetPlatforms: (row.targetPlatforms as string[]) ?? [],
        strategyNotes: row.strategyNotes ?? '',
      },
      assets: assets.map(a => ({
        id: String(a.id),
        name: a.originalName,
        type: a.assetType,
        size: this.formatFileSize(a.fileSize),
        url: a.url,
        uploadedAt: a.createdAt.toISOString().split('T')[0],
      })),
    };
  }

  private rowToFrontendIntegration(row: any): FrontendIntegration {
    return {
      id: row.id,
      integrationId: row.integrationId,
      status: row.status as any,
      lastSyncAt: row.lastSyncAt ? row.lastSyncAt.toISOString() : null,
      metrics: (row.metricsJson as any[]) ?? [],
      errorMessage: row.errorMessage ?? null,
      hasApiKey: !!row.apiKey,
    };
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
}
