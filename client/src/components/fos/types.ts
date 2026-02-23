// FinesseOS Pro — Shared Types
export type ComplianceStatus = 'passed' | 'warning' | 'failed';
export type LinkStatus = 'active' | 'alert' | 'paused';
export type AssetType = 'image' | 'copy' | 'video' | 'banner';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  size: string;
  url?: string;
  uploadedAt: string;
}

export interface Persona {
  name: string;
  pain: string;
  hook: string;
  platform?: string;
}

export interface Intelligence {
  keywordResearch: string[];
  marketingAngle: string;
  personas: Persona[];
  contentSuggestions: string[];
  targetPlatforms: string[];
  strategyNotes?: string;
}

export interface Compliance {
  disclosure: string;
  rules: string[];
  status: ComplianceStatus;
  lastChecked?: string;
  ftcNotes?: string;
}

export interface AffiliateLink {
  id: string;
  brandName: string;
  slug: string;
  platform: string;
  destination: string;
  status: LinkStatus;
  clicks: string;
  earnings?: string;
  commission?: string;
  compliance: Compliance;
  assets: Asset[];
  intelligence: Intelligence;
  createdAt: string;
  category?: string;
}
