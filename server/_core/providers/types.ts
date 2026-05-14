import type { User, InsertUser, InsertAffiliateNode, InsertNodeAsset } from "../../../drizzle/schema";
import type { Request } from "express";
import type { FrontendNode, FrontendIntegration } from "../../db";

export interface IAuthProvider {
  /**
   * Authenticate a request and return the user.
   * Throws an error if authentication fails.
   */
  authenticate(req: Request): Promise<User>;
  
  /**
   * Create a session token for a user.
   */
  createSession(userId: string, name?: string): Promise<string>;
  
  /**
   * Verify a session token and return the payload.
   */
  verifySession(token: string): Promise<{ userId: string; name: string } | null>;
  
  /**
   * Handle OAuth callback and return user info.
   */
  handleCallback(code: string, state: string): Promise<{ openId: string; name: string; email?: string | null; platform?: string }>;
}

export interface IDataProvider {
  // User operations
  getUserByOpenId(openId: string): Promise<User | undefined>;
  upsertUser(user: Partial<InsertUser> & { openId: string }): Promise<void>;

  // Affiliate Node operations
  getNodesByUserId(userId: string): Promise<FrontendNode[]>;
  getNodeById(nodeId: string, userId: string): Promise<FrontendNode | null>;
  createNode(userId: string, data: any): Promise<string>;
  deleteNode(nodeId: string, userId: string): Promise<void>;
  updateNodeStatus(nodeId: string, userId: string, status: 'active' | 'paused' | 'alert'): Promise<void>;
  getNodeByTrackingId(trackingId: string): Promise<any | null>;
  incrementNodeClickCount(nodeId: string): Promise<void>;

  // Asset operations
  getAssetsByNodeId(nodeId: string, userId: string): Promise<any[]>;
  createAsset(data: InsertNodeAsset): Promise<string>;
  deleteAsset(assetId: string, userId: string): Promise<string>;

  // User Integration operations
  getUserIntegrations(userId: string): Promise<FrontendIntegration[]>;
  getUserIntegration(userId: string, integrationId: string): Promise<FrontendIntegration | null>;
  upsertUserIntegration(userId: string, integrationId: string, data: {
    status: 'connected' | 'disconnected' | 'pending' | 'error';
    apiKey?: string | null;
    metadata?: any;
    lastSyncAt?: Date | null;
    metrics?: any;
    errorMessage?: string | null;
  }): Promise<void>;
  disconnectUserIntegration(userId: string, integrationId: string): Promise<void>;

  // Action Feed operations
  createAction(userId: string, data: any): Promise<string>;
  getActions(userId: string, limit?: number): Promise<any[]>;

  // System Metrics operations
  updateSystemMetric(userId: string, data: any): Promise<void>;
  getSystemMetrics(userId: string): Promise<any[]>;
}
