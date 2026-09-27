/**
 * asset-transfer.ts
 *
 * Supply-chain asset-management chaincode for Sherloque.
 *
 * Implements:
 *   CreateAsset      — manufacture a new supply-chain asset
 *   ReadAsset        — retrieve the current state of an asset
 *   UpdateAsset      — update description / status / metadata
 *   TransferAsset    — change owner and ownerOrganization
 *   DeleteAsset      — mark an asset as deleted (tombstone)
 *   AssetExists      — existence check (used internally and externally)
 *   GetAssetHistory  — full provenance chain for investigation
 *   GetAllAssets     — list summaries of all assets on the channel
 *
 * Language choice: TypeScript / Node.js
 *   • Aligns with the planned Node.js backend (Phase 2) so the shared
 *     type package can be consumed by both layers.
 *   • fabric-shim 2.x supports Node.js chaincode natively.
 *   • TypeScript gives compile-time safety for the on-ledger schema.
 */

import { Contract, Context } from 'fabric-contract-api';
import {
  Asset,
  AssetType,
  AssetStatus,
  AssetSummary,
  AssetHistoryEntry,
} from './asset-types';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Extract the caller's CN from their X.509 certificate. */
function getCallerCN(ctx: Context): string {
  const id = ctx.clientIdentity;
  // getID() returns a string like "x509::/CN=manufacturerUser/O=Org1..."
  const idStr = id.getID();
  const match = idStr.match(/CN=([^/,]+)/);
  return match ? match[1] : idStr;
}

/** Return the MSP ID of the caller. */
function getCallerMSP(ctx: Context): string {
  return ctx.clientIdentity.getMSPID();
}

/** Current UTC timestamp as ISO-8601 string. */
function nowISO(ctx: Context): string {
  // Use Fabric transaction timestamp for determinism across all peers.
  const ts = ctx.stub.getTxTimestamp();
  const millis = ts.seconds.toNumber() * 1000 + Math.floor(ts.nanos / 1e6);
  return new Date(millis).toISOString();
}

// ─── chaincode ───────────────────────────────────────────────────────────────

export class AssetTransferContract extends Contract {
  constructor() {
    super('AssetTransfer');
  }

  // ── Init ────────────────────────────────────────────────────────────────

  /** Called once when the chaincode is instantiated/upgraded. */
  async InitLedger(_ctx: Context): Promise<void> {
    // Nothing to seed — sample data is loaded via run-sample-workflow.sh.
  }

  // ── Existence check ─────────────────────────────────────────────────────

  /**
   * AssetExists — returns "true"/"false" JSON string.
   *
   * Exposed as a transaction so the investigation backend can check
   * existence without a full read.
   */
  async AssetExists(ctx: Context, id: string): Promise<string> {
    const raw = await ctx.stub.getState(id);
    return JSON.stringify(!!raw && raw.length > 0);
  }

  // ── CRUD ────────────────────────────────────────────────────────────────

  /**
   * CreateAsset — write a new asset to the ledger.
   *
   * Arguments:
   *   id          — globally unique asset ID (e.g. "SHIP-001")
   *   assetType   — SHIPMENT | INVOICE | PURCHASE_ORDER
   *   description — human-readable description
   *   metadataJSON — JSON object of arbitrary key/value metadata
   *
   * The owner and ownerOrganization are derived from the caller's
   * X.509 identity so they cannot be spoofed by the client.
   */
  async CreateAsset(
    ctx: Context,
    id: string,
    assetType: string,
    description: string,
    metadataJSON: string,
  ): Promise<void> {
    const existsRaw = await ctx.stub.getState(id);
    if (existsRaw && existsRaw.length > 0) {
      throw new Error(`Asset ${id} already exists`);
    }
    // existsRaw is Uint8Array — use Buffer.from() for all string conversions

    const validTypes: AssetType[] = ['SHIPMENT', 'INVOICE', 'PURCHASE_ORDER'];
    if (!validTypes.includes(assetType as AssetType)) {
      throw new Error(`Invalid asset type: ${assetType}. Must be one of ${validTypes.join(', ')}`);
    }

    let metadata: Record<string, string>;
    try {
      metadata = JSON.parse(metadataJSON);
    } catch {
      throw new Error('metadataJSON must be a valid JSON object');
    }

    const now = nowISO(ctx);
    const asset: Asset = {
      id,
      type: assetType as AssetType,
      description,
      owner: getCallerCN(ctx),
      ownerOrganization: getCallerMSP(ctx),
      status: 'CREATED',
      createdAt: now,
      updatedAt: now,
      metadata,
    };

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }

  /**
   * ReadAsset — retrieve the current asset state.
   *
   * Returns the full Asset JSON string.
   */
  async ReadAsset(ctx: Context, id: string): Promise<string> {
    const raw = await ctx.stub.getState(id);
    if (!raw || raw.length === 0) {
      throw new Error(`Asset ${id} does not exist`);
    }
    return Buffer.from(raw).toString('utf8');
  }

  /**
   * UpdateAsset — update description, status, and/or metadata.
   *
   * Arguments:
   *   id             — asset ID
   *   description    — new description (pass empty string to keep current)
   *   newStatus      — new status (pass empty string to keep current)
   *   metadataJSON   — new metadata (pass "{}" to clear, empty string to keep current)
   *
   * Owner and ownerOrganization are NOT changed here — use TransferAsset.
   */
  async UpdateAsset(
    ctx: Context,
    id: string,
    description: string,
    newStatus: string,
    metadataJSON: string,
  ): Promise<void> {
    const raw = await ctx.stub.getState(id);
    if (!raw || raw.length === 0) {
      throw new Error(`Asset ${id} does not exist`);
    }

    const asset: Asset = JSON.parse(Buffer.from(raw).toString('utf8'));

    if (description.trim() !== '') {
      asset.description = description;
    }

    if (newStatus.trim() !== '') {
      const validStatuses: AssetStatus[] = ['CREATED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(newStatus as AssetStatus)) {
        throw new Error(`Invalid status: ${newStatus}. Must be one of ${validStatuses.join(', ')}`);
      }
      asset.status = newStatus as AssetStatus;
    }

    if (metadataJSON.trim() !== '') {
      let metadata: Record<string, string>;
      try {
        metadata = JSON.parse(metadataJSON);
      } catch {
        throw new Error('metadataJSON must be a valid JSON object');
      }
      asset.metadata = metadata;
    }

    asset.updatedAt = nowISO(ctx);
    await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
  }

  /**
   * TransferAsset — change ownership of an asset.
   *
   * Arguments:
   *   id               — asset ID
   *   newOwner         — CN of the new owner identity
   *   newOrganization  — MSP ID of the new owning organization
   *
   * The new owner's CN and org are supplied explicitly rather than
   * inferred from the caller so that an authorized intermediary
   * (e.g. the Bank) can transfer on behalf of a counterparty.
   * Future endorsement-policy work can restrict this further.
   *
   * Returns the previous owner so the investigation layer can record
   * the provenance change without needing a separate read.
   */
  async TransferAsset(
    ctx: Context,
    id: string,
    newOwner: string,
    newOrganization: string,
  ): Promise<string> {
    const raw = await ctx.stub.getState(id);
    if (!raw || raw.length === 0) {
      throw new Error(`Asset ${id} does not exist`);
    }

    const asset: Asset = JSON.parse(Buffer.from(raw).toString('utf8'));
    const previousOwner = asset.owner;
    const previousOrg = asset.ownerOrganization;

    asset.owner = newOwner;
    asset.ownerOrganization = newOrganization;
    asset.status = 'IN_TRANSIT';
    asset.updatedAt = nowISO(ctx);

    // Persist a transfer event so the investigation layer can detect it.
    ctx.stub.setEvent(
      'AssetTransferred',
      Buffer.from(
        JSON.stringify({
          assetId: id,
          previousOwner,
          previousOrganization: previousOrg,
          newOwner,
          newOrganization,
          txId: ctx.stub.getTxID(),
          timestamp: asset.updatedAt,
        }),
      ),
    );

    await ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));

    // Return previous owner so callers get a one-trip confirmation.
    return JSON.stringify({ previousOwner, previousOrganization: previousOrg });
  }

  /**
   * DeleteAsset — remove an asset from the active state.
   *
   * The ledger history is NEVER destroyed; GetAssetHistory will still
   * show the full provenance including this deletion.
   */
  async DeleteAsset(ctx: Context, id: string): Promise<void> {
    const raw = await ctx.stub.getState(id);
    if (!raw || raw.length === 0) {
      throw new Error(`Asset ${id} does not exist`);
    }
    await ctx.stub.deleteState(id);
  }

  // ── Existence re-check used internally by DeleteAsset ───────────────────

  // ── Investigation queries ────────────────────────────────────────────────

  /**
   * GetAssetHistory — full provenance chain for a single asset.
   *
   * Returns an array of AssetHistoryEntry objects.  Each entry includes:
   *   • txId       — the Fabric transaction ID
   *   • timestamp  — the Fabric transaction timestamp (ISO-8601)
   *   • value      — the full asset state at that point (null if deleted)
   *   • isDelete   — true when the entry represents a deletion
   *
   * This is the primary evidence source for the Phase 3 investigation agents.
   */
  async GetAssetHistory(ctx: Context, id: string): Promise<string> {
    const history: AssetHistoryEntry[] = [];

    // Use for-await-of — the iterator is AsyncIterable<KeyModification>
    for await (const kv of ctx.stub.getHistoryForKey(id)) {
      const millis =
        kv.timestamp.seconds.toNumber() * 1000 + Math.floor(kv.timestamp.nanos / 1e6);

      const entry: AssetHistoryEntry = {
        txId: kv.txId,
        timestamp: new Date(millis).toISOString(),
        isDelete: kv.isDelete,
        value: kv.isDelete ? null : JSON.parse(Buffer.from(kv.value).toString('utf8')),
      };
      history.push(entry);
    }

    return JSON.stringify(history);
  }

  /**
   * GetAllAssets — lightweight list of all assets on the channel.
   *
   * Uses a full ledger scan (getStateByRange with empty keys) which is
   * acceptable for demo-scale data.  Phase 2 should add CouchDB rich
   * queries or composite-key indexes for production use.
   *
   * Returns an array of AssetSummary objects.
   */
  async GetAllAssets(ctx: Context): Promise<string> {
    const assets: AssetSummary[] = [];

    // Use for-await-of — the iterator is AsyncIterable<KV>
    for await (const kv of ctx.stub.getStateByRange('', '')) {
      const asset: Asset = JSON.parse(Buffer.from(kv.value).toString('utf8'));
      assets.push({
        id: asset.id,
        type: asset.type,
        description: asset.description,
        owner: asset.owner,
        ownerOrganization: asset.ownerOrganization,
        status: asset.status,
      });
    }

    return JSON.stringify(assets);
  }
}
