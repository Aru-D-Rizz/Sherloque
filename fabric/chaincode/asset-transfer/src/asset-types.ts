/**
 * asset-types.ts
 *
 * Domain types for the Sherloque supply-chain asset chaincode.
 * These are the canonical on-ledger structures.  Any change here
 * is a ledger schema change — update GetAssetHistory parsing too.
 */

/** Allowed asset types for the supply-chain demo. */
export type AssetType = 'SHIPMENT' | 'INVOICE' | 'PURCHASE_ORDER';

/** Life-cycle status of an asset. */
export type AssetStatus = 'CREATED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

/**
 * The on-ledger asset record.
 *
 * All timestamps are ISO-8601 strings so they round-trip cleanly through
 * JSON without precision loss and are readable in the Fabric explorer.
 */
export interface Asset {
  /** Ledger composite key — must be unique across the channel. */
  id: string;

  /** Discriminator used by the investigation agent. */
  type: AssetType;

  /** Human-readable description. */
  description: string;

  /** Current owner identity (CN from X.509 certificate). */
  owner: string;

  /** MSP ID of the current owning organization. */
  ownerOrganization: string;

  /** Life-cycle status. */
  status: AssetStatus;

  /** ISO-8601 creation timestamp (set once at CreateAsset). */
  createdAt: string;

  /** ISO-8601 last-update timestamp (updated on every write). */
  updatedAt: string;

  /**
   * Arbitrary key/value metadata preserved by the investigation layer.
   * Chaincode treats this as opaque; it does not interpret the values.
   */
  metadata: Record<string, string>;
}

/**
 * Minimal summary returned by GetAllAssets to avoid large payloads
 * when listing hundreds of assets.
 */
export interface AssetSummary {
  id: string;
  type: AssetType;
  description: string;
  owner: string;
  ownerOrganization: string;
  status: AssetStatus;
}

/** A single entry in the provenance chain returned by GetAssetHistory. */
export interface AssetHistoryEntry {
  /** Fabric transaction ID that produced this version. */
  txId: string;

  /** ISO-8601 timestamp embedded in the Fabric transaction. */
  timestamp: string;

  /** The full asset state at this point in time, or null if deleted. */
  value: Asset | null;

  /** True when the asset was deleted via DeleteAsset. */
  isDelete: boolean;
}
