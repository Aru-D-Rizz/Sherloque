/**
 * index.ts — chaincode entry point.
 *
 * fabric-shim discovers the contract class via the exports here.
 */
import { AssetTransferContract } from './asset-transfer';

export { AssetTransferContract };
export * from './asset-types';
