// packages/shared/src/types.ts

export interface NFEOCreator {
  identity: string;
  organization: string;
  msp: string;
  certificate?: string;
}

export interface NFEOAsset {
  id: string;
  type: string;
  previousOwner: string;
  previousOrganization: string;
  newOwner: string;
  newOrganization: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface NFEOTransaction {
  transactionId: string;
  blockNumber: number;
  timestamp: string;
  channel: string;
  chaincode: string;
  function: string;
  creator: NFEOCreator;
  asset?: NFEOAsset;
  args?: string[];
  endorsers: string[];
  validationCode: string;
  rawPayload?: Record<string, unknown>;
}

export interface AnomalyFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  type: string;
  title: string;
  description: string;
  evidenceTransactionIds: string[];
  recommendation: string;
}

export interface InvestigationScenario {
  id: string;
  name: string;
  description: string;
  targetAssetId: string;
  targetTransactionId: string;
  channel: string;
  chaincode: string;
  createdAt: string;
  transactions: NFEOTransaction[];
  anomalies: AnomalyFinding[];
  expectedWorkflow: string[];
  observedWorkflow: string[];
  summary: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FabricBlockInfo {
  blockNumber: number;
  dataHash: string;
  transactionCount: number;
  timestamp: string;
}

export interface IdentityInfo {
  identity: string;
  mspId: string;
  organization: string;
  totalTransactions: number;
  roles: string[];
}

export interface ChaincodeInfo {
  name: string;
  version: string;
  channel: string;
  sequence: number;
  endorsementPolicy: string;
}

export interface InvestigationReport {
  investigationId: string;
  targetAssetId: string;
  riskLevel: string;
  generatedAt: string;
  summary: string;
  anomalies: AnomalyFinding[];
  timeline: { step: number; function: string; timestamp: string; identity: string; anomaly: boolean }[];
  evidenceSummary: string;
  markdownContent: string;
}
