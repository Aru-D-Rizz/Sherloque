import { Router, Request, Response } from 'express';
import { CONFIG } from '../config';
import { InvestigationAgent } from '../engine/investigation-agent';
import { EvidenceNormalizer } from '../services/evidence-normalizer';
import { DEMO_INVESTIGATION } from '../../../packages/shared/src/demo-data';

export const investigationRouter = Router();

// Health check & status
investigationRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    demoMode: CONFIG.DEMO_MODE,
    channel: CONFIG.FABRIC.CHANNEL_NAME,
    chaincode: CONFIG.FABRIC.CHAINCODE_NAME,
    timestamp: new Date().toISOString(),
  });
});

// GET transaction lookup
investigationRouter.get('/transactions/:txId', (req: Request, res: Response) => {
  const { txId } = req.params;
  const match = DEMO_INVESTIGATION.transactions.find(t => t.transactionId.toLowerCase() === txId.toLowerCase() || t.transactionId.startsWith(txId));
  if (!match) {
    return res.status(404).json({ error: 'Transaction not found on ledger' });
  }
  return res.json({ ok: true, transaction: match, demoMode: CONFIG.DEMO_MODE });
});

// GET asset lookup
investigationRouter.get('/assets/:assetId', (req: Request, res: Response) => {
  const { assetId } = req.params;
  const matchTxs = DEMO_INVESTIGATION.transactions.filter(t => t.asset?.id.toLowerCase() === assetId.toLowerCase());
  if (matchTxs.length === 0) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  const latestTx = matchTxs[matchTxs.length - 1];
  return res.json({ ok: true, asset: latestTx.asset, latestTransaction: latestTx, demoMode: CONFIG.DEMO_MODE });
});

// GET asset history
investigationRouter.get('/assets/:assetId/history', (req: Request, res: Response) => {
  const { assetId } = req.params;
  const history = DEMO_INVESTIGATION.transactions.filter(t => t.asset?.id.toLowerCase() === assetId.toLowerCase());
  return res.json({ ok: true, assetId, history, demoMode: CONFIG.DEMO_MODE });
});

// GET transaction history
investigationRouter.get('/transactions', (_req: Request, res: Response) => {
  return res.json({ ok: true, transactions: DEMO_INVESTIGATION.transactions, demoMode: CONFIG.DEMO_MODE });
});

// GET identity information
investigationRouter.get('/identities/:identityId', (req: Request, res: Response) => {
  const { identityId } = req.params;
  const matchingTxs = DEMO_INVESTIGATION.transactions.filter(
    t => t.creator.identity.toLowerCase() === identityId.toLowerCase() || t.creator.msp.toLowerCase() === identityId.toLowerCase()
  );
  if (matchingTxs.length === 0) {
    return res.status(404).json({ error: 'Identity not found' });
  }
  return res.json({
    ok: true,
    identity: matchingTxs[0].creator,
    totalTransactions: matchingTxs.length,
    transactions: matchingTxs,
    demoMode: CONFIG.DEMO_MODE,
  });
});

// GET related transactions
investigationRouter.get('/transactions/:txId/related', (req: Request, res: Response) => {
  const { txId } = req.params;
  const current = DEMO_INVESTIGATION.transactions.find(t => t.transactionId.startsWith(txId));
  if (!current) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  const related = DEMO_INVESTIGATION.transactions.filter(
    t => t.transactionId !== current.transactionId && (t.asset?.id === current.asset?.id || t.creator.msp === current.creator.msp)
  );
  return res.json({ ok: true, baseTxId: txId, related, demoMode: CONFIG.DEMO_MODE });
});

// GET chaincode information
investigationRouter.get('/chaincode/info', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    chaincode: {
      name: CONFIG.FABRIC.CHAINCODE_NAME,
      version: '1.0.0',
      channel: CONFIG.FABRIC.CHANNEL_NAME,
      sequence: 1,
      endorsementPolicy: "AND('Org1MSP.peer', 'Org2MSP.peer')",
    },
    demoMode: CONFIG.DEMO_MODE,
  });
});

// GET Fabric events
investigationRouter.get('/events', (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    events: DEMO_INVESTIGATION.transactions.map(t => ({
      eventName: t.function === 'CreateAsset' ? 'AssetCreated' : 'AssetTransferred',
      chaincodeId: t.chaincode,
      txId: t.transactionId,
      blockNumber: t.blockNumber,
      payload: t.asset,
    })),
    demoMode: CONFIG.DEMO_MODE,
  });
});

// POST investigation creation / retrieval
investigationRouter.post('/investigations', async (req: Request, res: Response) => {
  const { target } = req.body || {};
  const targetId = (target as string) || DEMO_INVESTIGATION.id;
  const result = await InvestigationAgent.runInvestigation(targetId);
  return res.json({ ok: true, investigation: result.scenario, report: result.report, demoMode: CONFIG.DEMO_MODE });
});

// GET investigation evidence
investigationRouter.get('/investigations/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const scenario = EvidenceNormalizer.getNormalizedInvestigation(id);
  return res.json({ ok: true, investigation: scenario, demoMode: CONFIG.DEMO_MODE });
});

// POST ask question
investigationRouter.post('/investigations/:id/ask', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { question } = req.body || {};
  if (!question) {
    return res.status(400).json({ error: 'Question string is required' });
  }
  const answerResult = await InvestigationAgent.askQuestion(question, id);
  return res.json({ ok: true, ...answerResult });
});
