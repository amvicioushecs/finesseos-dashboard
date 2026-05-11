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
  upsertUser(user: InsertUser): Promise<void>;

  // Affiliate Node operations
  getNodesByUserId(userId: number): Promise<FrontendNode[]>;
  getNodeById(nodeId: number, userId: number): Promise<FrontendNode | null>;
  createNode(userId: number, data: any): Promise<number>;
  deleteNode(nodeId: number, userId: number): Promise<void>;
  updateNodeStatus(nodeId: number, userId: number, status: 'active' | 'paused' | 'alert'): Promise<void>;
  getNodeByTrackingId(trackingId: string): Promise<any | null>;
  incrementNodeClickCount(nodeId: number): Promise<void>;

  // Asset operations
  getAssetsByNodeId(nodeId: number, userId: number): Promise<any[]>;
  createAsset(data: InsertNodeAsset): Promise<number>;
  deleteAsset(assetId: number, userId: number): Promise<string>;

  // User Integration operations
  getUserIntegrations(userId: number): Promise<FrontendIntegration[]>;
  getUserIntegration(userId: number, integrationId: string): Promise<FrontendIntegration | null>;
  upsertUserIntegration(userId: number, integrationId: string, data: {
    status: 'connected' | 'disconnected' | 'pending' | 'error';
    apiKey?: string | null;
    metadataJson?: string | null;
    lastSyncAt?: Date | null;
    metricsJson?: string | null;
    errorMessage?: string | null;
  }): Promise<void>;
  disconnectUserIntegration(userId: number, integrationId: string): Promise<void>;

  // Action Feed operations
  createAction(userId: number, data: {
    type: string;
    title: string;
    message: string;
    metadataJson?: any;
  }): Promise<number>;
  getActions(userId: number, limit?: number): Promise<any[]>;

  // System Metrics operations
  updateSystemMetric(userId: number, data: {
    name: string;
    value: string;
    unit?: string;
    category?: string;
  }): Promise<void>;
  getSystemMetrics(userId: number): Promise<any[]>;
}
