import { NFEOTransaction, AnomalyFinding } from '../../../packages/shared/src/types';

export class EvidenceAgent {
  public static correlateEvidence(anomalies: AnomalyFinding[], transactions: NFEOTransaction[]) {
    const txMap = new Map(transactions.map(t => [t.transactionId, t]));

    return anomalies.map(anomaly => {
      const referencedTxs = anomaly.evidenceTransactionIds
        .map(id => txMap.get(id))
        .filter((t): t is NFEOTransaction => t !== undefined);

      const blocks = Array.from(new Set(referencedTxs.map(t => t.blockNumber)));
      const msps = Array.from(new Set(referencedTxs.map(t => t.creator.msp)));

      return {
        anomalyId: anomaly.id,
        title: anomaly.title,
        evidence: {
          transactionCount: referencedTxs.length,
          blocks,
          msps,
          transactionSummary: referencedTxs.map(t => ({
            txId: t.transactionId,
            blockNumber: t.blockNumber,
            timestamp: t.timestamp,
            function: t.function,
            creator: `${t.creator.identity}@${t.creator.msp}`,
            endorsers: t.endorsers,
          })),
        },
      };
    });
  }
}
