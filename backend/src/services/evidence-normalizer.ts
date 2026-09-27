import { NFEOTransaction, NFEOCreator, NFEOAsset, AnomalyFinding, InvestigationScenario } from '../../../packages/shared/src/types';
import { DEMO_INVESTIGATION, SAMPLE_NORMAL_INVESTIGATION } from '../../../packages/shared/src/demo-data';

export class EvidenceNormalizer {
  public static normalizeTransaction(raw: Record<string, unknown>): NFEOTransaction {
    const creatorRaw = (raw.creator as Record<string, string>) || {};
    const assetRaw = (raw.asset as Record<string, string>) || {};

    const creator: NFEOCreator = {
      identity: creatorRaw.identity || 'unknown-identity',
      organization: creatorRaw.organization || 'Org1',
      msp: creatorRaw.msp || 'Org1MSP',
      certificate: creatorRaw.certificate,
    };

    const asset: NFEOAsset | undefined = raw.asset
      ? {
          id: assetRaw.id || 'UNKNOWN-ASSET',
          type: assetRaw.type || 'ASSET',
          previousOwner: assetRaw.previousOwner || '',
          previousOrganization: assetRaw.previousOrganization || '',
          newOwner: assetRaw.newOwner || '',
          newOrganization: assetRaw.newOrganization || '',
          status: assetRaw.status || 'ACTIVE',
          metadata: raw.metadata as Record<string, unknown>,
        }
      : undefined;

    return {
      transactionId: (raw.transactionId as string) || (raw.txId as string) || `tx-${Date.now()}`,
      blockNumber: typeof raw.blockNumber === 'number' ? raw.blockNumber : 0,
      timestamp: (raw.timestamp as string) || new Date().toISOString(),
      channel: (raw.channel as string) || 'tradechannel',
      chaincode: (raw.chaincode as string) || 'asset-transfer',
      function: (raw.function as string) || 'TransferAsset',
      creator,
      asset,
      args: (raw.args as string[]) || [],
      endorsers: (raw.endorsers as string[]) || ['Org1MSP', 'Org2MSP'],
      validationCode: (raw.validationCode as string) || 'VALID',
      rawPayload: raw,
    };
  }

  public static getNormalizedInvestigation(targetId: string): InvestigationScenario {
    if (targetId.includes('2841') || targetId.includes('1002')) {
      return SAMPLE_NORMAL_INVESTIGATION;
    }
    return DEMO_INVESTIGATION;
  }
}
