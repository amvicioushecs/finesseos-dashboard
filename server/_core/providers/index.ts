import { LocalAuthProvider } from "./localAuth";
import { PostgresDataProvider } from "./postgresData";
import type { IAuthProvider, IDataProvider } from "./types";

let _authProvider: IAuthProvider | null = null;
let _dataProvider: IDataProvider | null = null;

export const authProvider = {
  authenticate: (req: any) => getAuthProvider().authenticate(req),
  createSession: (userId: string, name?: string) => getAuthProvider().createSession(userId, name),
  verifySession: (token: string) => getAuthProvider().verifySession(token),
  handleCallback: (code: string, state: string) => getAuthProvider().handleCallback(code, state),
} as IAuthProvider;

export const dataProvider = {
  getUserByOpenId: (openId: string) => getDataProvider().getUserByOpenId(openId),
  upsertUser: (user: any) => getDataProvider().upsertUser(user),
  getNodesByUserId: (userId: string) => getDataProvider().getNodesByUserId(userId),
  getNodeById: (nodeId: string, userId: string) => getDataProvider().getNodeById(nodeId, userId),
  createNode: (userId: string, data: any) => getDataProvider().createNode(userId, data),
  deleteNode: (nodeId: string, userId: string) => getDataProvider().deleteNode(nodeId, userId),
  updateNodeStatus: (nodeId: string, userId: string, status: any) => getDataProvider().updateNodeStatus(nodeId, userId, status),
  getNodeByTrackingId: (trackingId: string) => getDataProvider().getNodeByTrackingId(trackingId),
  incrementNodeClickCount: (nodeId: string) => getDataProvider().incrementNodeClickCount(nodeId),
  getAssetsByNodeId: (nodeId: string, userId: string) => getDataProvider().getAssetsByNodeId(nodeId, userId),
  createAsset: (data: any) => getDataProvider().createAsset(data),
  deleteAsset: (assetId: string, userId: string) => getDataProvider().deleteAsset(assetId, userId),
  getUserIntegrations: (userId: string) => getDataProvider().getUserIntegrations(userId),
  getUserIntegration: (userId: string, integrationId: string) => getDataProvider().getUserIntegration(userId, integrationId),
  upsertUserIntegration: (userId: string, integrationId: string, data: any) => getDataProvider().upsertUserIntegration(userId, integrationId, data),
  disconnectUserIntegration: (userId: string, integrationId: string) => getDataProvider().disconnectUserIntegration(userId, integrationId),
  createAction: (userId: string, data: any) => getDataProvider().createAction(userId, data),
  getActions: (userId: string, limit?: number) => getDataProvider().getActions(userId, limit),
  updateSystemMetric: (userId: string, data: any) => getDataProvider().updateSystemMetric(userId, data),
  getSystemMetrics: (userId: string) => getDataProvider().getSystemMetrics(userId)
} as IDataProvider;

function getAuthProvider() {
  if (!_authProvider) _authProvider = new LocalAuthProvider();
  return _authProvider;
}

function getDataProvider() {
  if (!_dataProvider) _dataProvider = new PostgresDataProvider();
  return _dataProvider;
}
