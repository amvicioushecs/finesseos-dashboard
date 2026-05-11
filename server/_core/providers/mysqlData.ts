import { User, InsertUser, InsertNodeAsset } from "../../../drizzle/schema";
import * as db from "../../db";
import type { IDataProvider } from "./types";
import type { FrontendNode, FrontendIntegration } from "../../db";

export class MySqlDataProvider implements IDataProvider {
  // User operations
  async getUserByOpenId(openId: string): Promise<User | undefined> {
    return db.getUserByOpenId(openId);
  }

  async upsertUser(user: InsertUser): Promise<void> {
    return db.upsertUser(user);
  }

  // Affiliate Node operations
  async getNodesByUserId(userId: number): Promise<FrontendNode[]> {
    return db.getNodesByUserId(userId);
  }

  async getNodeById(nodeId: number, userId: number): Promise<FrontendNode | null> {
    return db.getNodeById(nodeId, userId);
  }

  async createNode(userId: number, data: any): Promise<number> {
    return db.createNode(userId, data);
  }

  async deleteNode(nodeId: number, userId: number): Promise<void> {
    return db.deleteNode(nodeId, userId);
  }

  async updateNodeStatus(nodeId: number, userId: number, status: 'active' | 'paused' | 'alert'): Promise<void> {
    return db.updateNodeStatus(nodeId, userId, status);
  }

  async getNodeByTrackingId(trackingId: string): Promise<any | null> {
    return db.getNodeByTrackingId(trackingId);
  }

  async incrementNodeClickCount(nodeId: number): Promise<void> {
    return db.incrementNodeClickCount(nodeId);
  }

  // Asset operations
  async getAssetsByNodeId(nodeId: number, userId: number): Promise<any[]> {
    return db.getAssetsByNodeId(nodeId, userId);
  }

  async createAsset(data: InsertNodeAsset): Promise<number> {
    return db.createAsset(data);
  }

  async deleteAsset(assetId: number, userId: number): Promise<string> {
    return db.deleteAsset(assetId, userId);
  }

  // User Integration operations
  async getUserIntegrations(userId: number): Promise<FrontendIntegration[]> {
    return db.getUserIntegrations(userId);
  }

  async getUserIntegration(userId: number, integrationId: string): Promise<FrontendIntegration | null> {
    return db.getUserIntegration(userId, integrationId);
  }

  async upsertUserIntegration(userId: number, integrationId: string, data: {
    status: 'connected' | 'disconnected' | 'pending' | 'error';
    apiKey?: string | null;
    metadataJson?: string | null;
    lastSyncAt?: Date | null;
    metricsJson?: string | null;
    errorMessage?: string | null;
  }): Promise<void> {
    return db.upsertUserIntegration(userId, integrationId, data);
  }

  async disconnectUserIntegration(userId: number, integrationId: string): Promise<void> {
    return db.disconnectUserIntegration(userId, integrationId);
  }

  // Action Feed operations
  async createAction(userId: number, data: { type: string; title: string; message: string; metadataJson?: any }): Promise<number> {
    return db.createAction(userId, data);
  }

  async getActions(userId: number, limit?: number): Promise<any[]> {
    return db.getActions(userId, limit);
  }

  // System Metrics operations
  async updateSystemMetric(userId: number, data: { name: string; value: string; unit?: string; category?: string }): Promise<void> {
    return db.updateSystemMetric(userId, data);
  }

  async getSystemMetrics(userId: number): Promise<any[]> {
    return db.getSystemMetrics(userId);
  }
}
