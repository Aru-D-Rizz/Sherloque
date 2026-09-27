import { NFEOTransaction } from '../../../packages/shared/src/types';

export class TransactionAgent {
  public static analyzeTransactions(transactions: NFEOTransaction[]) {
    const totalTransactions = transactions.length;
    const functionsCalled = Array.from(new Set(transactions.map(t => t.function)));
    const blockRange = {
      min: Math.min(...transactions.map(t => t.blockNumber)),
      max: Math.max(...transactions.map(t => t.blockNumber)),
    };

    const firstTx = new Date(transactions[0]?.timestamp || Date.now()).getTime();
    const lastTx = new Date(transactions[transactions.length - 1]?.timestamp || Date.now()).getTime();
    const durationSeconds = Math.round((lastTx - firstTx) / 1000);

    return {
      totalTransactions,
      functionsCalled,
      blockRange,
      durationSeconds,
      hasEndorsementViolations: transactions.some(t => t.endorsers.length === 1 && t.endorsers.includes('Org3MSP')),
    };
  }
}
