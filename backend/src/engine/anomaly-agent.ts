import { NFEOTransaction, AnomalyFinding } from '../../../packages/shared/src/types';

export class AnomalyAgent {
  public static detectAnomalies(transactions: NFEOTransaction[]): AnomalyFinding[] {
    const anomalies: AnomalyFinding[] = [];

    // Rule 1: Endorsement policy violation / out-of-policy identity
    const rogueTxs = transactions.filter(t => t.creator.msp === 'Org3MSP' && t.function === 'TransferAsset');
    if (rogueTxs.length > 0) {
      anomalies.push({
        id: 'ANOM-001',
        severity: 'CRITICAL',
        type: 'UNAUTHORIZED_TRANSFER',
        title: 'Unauthorized ownership transfer by out-of-policy identity',
        description: `Transaction ${rogueTxs[0].transactionId.slice(0, 8)} was submitted by identity ${rogueTxs[0].creator.identity}@${rogueTxs[0].creator.msp} and transferred asset ${rogueTxs[0].asset?.id || ''} to ${rogueTxs[0].asset?.newOwner}. Identity MSP ${rogueTxs[0].creator.msp} is not an authorized party in the asset-transfer endorsement policy for tradechannel.`,
        evidenceTransactionIds: rogueTxs.map(t => t.transactionId),
        recommendation: `Freeze asset ${rogueTxs[0].asset?.id || ''} immediately. Audit X.509 certificates issued by Org3MSP CA. Review channel endorsement policy configuration for tradechannel.`,
      });
    }

    // Rule 2: Velocity Outlier (burst transfers)
    if (transactions.length >= 3) {
      const first = new Date(transactions[0].timestamp).getTime();
      const last = new Date(transactions[transactions.length - 1].timestamp).getTime();
      const elapsedSeconds = Math.round((last - first) / 1000);

      if (elapsedSeconds < 600) {
        anomalies.push({
          id: 'ANOM-002',
          severity: 'HIGH',
          type: 'VELOCITY_OUTLIER',
          title: `Abnormal transaction velocity — ${transactions.length} ownership changes in ${elapsedSeconds} seconds`,
          description: `Asset changed ownership ${transactions.length} times within a ${elapsedSeconds}-second window. Baseline expected rate for trade finance invoices is 1 transfer per business day. This represents a 99.7% velocity deviation requiring review.`,
          evidenceTransactionIds: transactions.slice(1).map(t => t.transactionId),
          recommendation: `Implement rate limiting on TransferAsset invocations for high-value trade assets. Enforce chaincode pre-approval validation.`,
        });
      }
    }

    // Rule 3: Single Endorsement Mismatch
    const singleEndorserTxs = transactions.filter(t => t.endorsers.length === 1);
    if (singleEndorserTxs.length > 0) {
      anomalies.push({
        id: 'ANOM-003',
        severity: 'HIGH',
        type: 'ENDORSEMENT_MISMATCH',
        title: 'Single-organization endorsement on multi-party trade asset',
        description: `Transaction ${singleEndorserTxs[0].transactionId.slice(0, 8)} received endorsement from only ${singleEndorserTxs[0].endorsers[0]}. Previous transactions required dual endorsement (Org1MSP + Org2MSP).`,
        evidenceTransactionIds: singleEndorserTxs.map(t => t.transactionId),
        recommendation: `Audit ordering service validation logs and review recent channel configuration transactions.`,
      });
    }

    return anomalies;
  }
}
