export interface NFEOCreator {
  identity: string;
  organization: string;
  msp: string;
}

export interface NFEOAsset {
  id: string;
  type: string;
  previousOwner: string;
  previousOrganization: string;
  newOwner: string;
  newOrganization: string;
  status: string;
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

export const DEMO_INVESTIGATION: InvestigationScenario = {
  id: 'INV-8391',
  name: 'Trade Finance Rogue Hijack',
  description: 'Autonomous investigation of suspicious invoice transfer activity on tradechannel.',
  targetAssetId: 'INVOICE-8391',
  targetTransactionId: 'a7f3c2d1e8b94f6a2c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6',
  channel: 'tradechannel',
  chaincode: 'asset-transfer',
  createdAt: '2026-09-27T09:20:00.000Z',
  riskLevel: 'CRITICAL',
  summary: 'Three anomalies detected. A rogue identity (rogue-agent@Org3MSP) performed an unauthorized asset transfer of invoice INVOICE-8391, bypassing the approved endorsement policy. Velocity outlier: 3 ownership changes in 4 minutes vs expected 1/day. Endorsement mismatch: Org3MSP signed without being in the asset-transfer endorsement policy.',
  expectedWorkflow: [
    'Supplier (Org1) creates invoice',
    'Supplier transfers invoice to Bank (Org2) for payment processing',
    'Bank (Org2) approves and marks invoice DELIVERED',
  ],
  observedWorkflow: [
    'Supplier (Org1) creates invoice INVOICE-8391',
    'Supplier transfers invoice to Bank (Org2) — NORMAL',
    'Bank (Org2) transfers invoice internally — UNEXPECTED',
    'Rogue agent (Org3) transfers invoice to UnknownEntity — ANOMALOUS',
  ],
  transactions: [
    {
      transactionId: 'b2c4d6e8f0a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3',
      blockNumber: 5,
      timestamp: '2026-09-27T09:20:01.000Z',
      channel: 'tradechannel',
      chaincode: 'asset-transfer',
      function: 'CreateAsset',
      creator: { identity: 'supplier-admin', organization: 'Org1', msp: 'Org1MSP' },
      asset: { id: 'INVOICE-8391', type: 'INVOICE', previousOwner: '', previousOrganization: '', newOwner: 'supplier-admin', newOrganization: 'Org1MSP', status: 'CREATED' },
      args: ['INVOICE-8391', 'INVOICE', 'Trade finance invoice for shipment SHP-4421', '{"amount":"$450,000"}'],
      endorsers: ['Org1MSP', 'Org2MSP'],
      validationCode: 'VALID',
    },
    {
      transactionId: 'c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5',
      blockNumber: 6,
      timestamp: '2026-09-27T09:21:15.000Z',
      channel: 'tradechannel',
      chaincode: 'asset-transfer',
      function: 'TransferAsset',
      creator: { identity: 'supplier-admin', organization: 'Org1', msp: 'Org1MSP' },
      asset: { id: 'INVOICE-8391', type: 'INVOICE', previousOwner: 'supplier-admin', previousOrganization: 'Org1MSP', newOwner: 'bank-officer', newOrganization: 'Org2MSP', status: 'IN_TRANSIT' },
      args: ['INVOICE-8391', 'bank-officer', 'Org2MSP'],
      endorsers: ['Org1MSP', 'Org2MSP'],
      validationCode: 'VALID',
    },
    {
      transactionId: 'd4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6',
      blockNumber: 7,
      timestamp: '2026-09-27T09:22:44.000Z',
      channel: 'tradechannel',
      chaincode: 'asset-transfer',
      function: 'TransferAsset',
      creator: { identity: 'bank-officer', organization: 'Org2', msp: 'Org2MSP' },
      asset: { id: 'INVOICE-8391', type: 'INVOICE', previousOwner: 'bank-officer', previousOrganization: 'Org2MSP', newOwner: 'distributor-clerk', newOrganization: 'Org2MSP', status: 'IN_TRANSIT' },
      args: ['INVOICE-8391', 'distributor-clerk', 'Org2MSP'],
      endorsers: ['Org1MSP', 'Org2MSP'],
      validationCode: 'VALID',
    },
    {
      transactionId: 'a7f3c2d1e8b94f6a2c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6',
      blockNumber: 8,
      timestamp: '2026-09-27T09:24:09.000Z',
      channel: 'tradechannel',
      chaincode: 'asset-transfer',
      function: 'TransferAsset',
      creator: { identity: 'rogue-agent', organization: 'Org3', msp: 'Org3MSP' },
      asset: { id: 'INVOICE-8391', type: 'INVOICE', previousOwner: 'distributor-clerk', previousOrganization: 'Org2MSP', newOwner: 'unknown-entity-7742', newOrganization: 'ExternalMSP', status: 'IN_TRANSIT' },
      args: ['INVOICE-8391', 'unknown-entity-7742', 'ExternalMSP'],
      endorsers: ['Org3MSP'],
      validationCode: 'VALID',
    },
  ],
  anomalies: [
    {
      id: 'ANOM-001',
      severity: 'CRITICAL',
      type: 'UNAUTHORIZED_TRANSFER',
      title: 'Unauthorized ownership transfer by out-of-policy identity',
      description: 'Transaction a7f3c2d1 was submitted by rogue-agent@Org3MSP and transferred INVOICE-8391 to unknown-entity-7742@ExternalMSP. Org3MSP is not a member of the endorsement policy for asset-transfer on tradechannel.',
      evidenceTransactionIds: ['a7f3c2d1e8b94f6a2c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6'],
      recommendation: 'Freeze asset INVOICE-8391. Investigate rogue-agent credentials from Org3MSP CA. Review channel endorsement policy.',
    },
    {
      id: 'ANOM-002',
      severity: 'HIGH',
      type: 'VELOCITY_OUTLIER',
      title: 'Abnormal transaction velocity — 3 transfers in 4 minutes',
      description: 'INVOICE-8391 changed ownership 3 times in 248 seconds. Historical baseline is 1 ownership change per business day. This deviates from expected workflow by 99.7%.',
      evidenceTransactionIds: ['c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5', 'd4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6', 'a7f3c2d1e8b94f6a2c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6'],
      recommendation: 'Implement rate limiting on TransferAsset for high-value invoice assets.',
    },
    {
      id: 'ANOM-003',
      severity: 'HIGH',
      type: 'ENDORSEMENT_MISMATCH',
      title: 'Single-organization endorsement on multi-party asset',
      description: 'Transaction a7f3c2d1 was endorsed only by Org3MSP. All previous INVOICE-8391 transactions required Org1MSP+Org2MSP endorsement. This transaction bypassed the standard endorsement policy.',
      evidenceTransactionIds: ['a7f3c2d1e8b94f6a2c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6'],
      recommendation: 'Audit recent channel configuration transactions for unauthorized policy changes.',
    },
  ],
};

export const DEMO_SCENARIOS = [
  { id: 'INV-8391', label: 'INV-8391 — Trade Finance Rogue Hijack', description: 'Unauthorized invoice transfer by Org3 rogue agent' },
  { id: 'SHIP-2841', label: 'SHIP-2841 — Supply Chain Anomaly', description: 'Unexpected shipment ownership change' },
];
