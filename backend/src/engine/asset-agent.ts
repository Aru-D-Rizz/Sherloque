import { NFEOTransaction } from '../../../packages/shared/src/types';

export class AssetAgent {
  public static analyzeAssetHistory(transactions: NFEOTransaction[]) {
    const assetId = transactions.find(t => t.asset?.id)?.asset?.id || 'UNKNOWN';
    const transitions = transactions
      .filter(t => t.asset)
      .map(t => ({
        blockNumber: t.blockNumber,
        timestamp: t.timestamp,
        fromOwner: t.asset?.previousOwner || '(new)',
        fromOrg: t.asset?.previousOrganization || '(none)',
        toOwner: t.asset?.newOwner || '',
        toOrg: t.asset?.newOrganization || '',
        status: t.asset?.status || 'UNKNOWN',
      }));

    const currentOwner = transitions[transitions.length - 1]?.toOwner || 'UNKNOWN';
    const currentOrg = transitions[transitions.length - 1]?.toOrg || 'UNKNOWN';
    const isTransferredToExternal = currentOrg.includes('External');

    return {
      assetId,
      transitionsCount: transitions.length,
      transitions,
      currentOwner,
      currentOrg,
      isTransferredToExternal,
    };
  }
}
