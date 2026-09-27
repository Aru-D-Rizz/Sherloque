import { NFEOTransaction } from '../../../packages/shared/src/types';

export class IdentityAgent {
  public static analyzeIdentities(transactions: NFEOTransaction[]) {
    const identities = new Map<string, { identity: string; msp: string; organization: string; txCount: number }>();

    for (const tx of transactions) {
      const key = `${tx.creator.identity}@${tx.creator.msp}`;
      const existing = identities.get(key) || {
        identity: tx.creator.identity,
        msp: tx.creator.msp,
        organization: tx.creator.organization,
        txCount: 0,
      };
      existing.txCount += 1;
      identities.set(key, existing);
    }

    const mspsInvolved = Array.from(new Set(transactions.map(t => t.creator.msp)));
    const outOfPolicyIdentities = transactions
      .filter(t => t.creator.msp === 'Org3MSP' && t.function === 'TransferAsset')
      .map(t => t.creator.identity);

    return {
      uniqueIdentities: Array.from(identities.values()),
      mspsInvolved,
      outOfPolicyIdentities,
      isRogueIdentityPresent: outOfPolicyIdentities.length > 0,
    };
  }
}
