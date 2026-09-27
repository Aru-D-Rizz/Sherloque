# Phase 1 — Fabric Foundation

This document describes the Phase 1 implementation decisions, what was built, and what Phase 2 needs to know.

---

## What was built in Phase 1

| Component | Location | Description |
|---|---|---|
| Fabric network scripts | `fabric/scripts/` | Start, stop, reset, install, deploy, sample workflow |
| Asset-transfer chaincode | `fabric/chaincode/asset-transfer/` | TypeScript chaincode with full CRUD + history |
| Asset types | `fabric/chaincode/asset-transfer/src/asset-types.ts` | On-ledger schema |
| README | `README.md` | Full operational documentation |
| `.env.example` | `.env.example` | Environment variable template |

---

## Network topology

| Component | Details |
|---|---|
| Fabric version | 2.5.7 (LTS) |
| Fabric CA version | 1.5.9 |
| Orderer | Single RAFT orderer (sufficient for demo) |
| Organizations | Org1 (Manufacturer), Org2 (Distributor), Org3 (Bank) |
| Channel | `tradechannel` |
| State DB | CouchDB (enables rich queries in Phase 2) |
| Chaincode language | TypeScript / Node.js |

---

## Why three organizations instead of four

The official `fabric-samples/test-network` natively supports Org1, Org2, and Org3.  Adding Org4 requires manual crypto generation and channel update transactions which would significantly complicate the first bring-up.

**Org4 (Retailer) can still participate in the Phase 1 workflow** because `TransferAsset` accepts any `newOwner` string.  When `retailerUser` is passed as the new owner, the ledger records the correct ownership even without a dedicated Org4 peer.

Adding a real Org4 peer is a natural Phase 1.1 extension once the core network is validated.

---

## Chaincode design decisions

### Language choice: TypeScript
- Aligns with Phase 2 Node.js backend
- Shared types (`Asset`, `AssetHistoryEntry`) can be extracted to `packages/shared` in Phase 2
- Compile-time safety for on-ledger schema changes
- `fabric-shim` 2.x has stable Node.js support

### Owner identity from X.509
The chaincode calls `ctx.clientIdentity.getID()` and `getMSPID()` to derive `owner` and `ownerOrganization`.  This means owner fields **cannot be spoofed** by the client application — they are always the real submitter.

### Fabric transaction timestamp
`ctx.stub.getTxTimestamp()` is used for `createdAt`/`updatedAt`.  This is the timestamp embedded in the Fabric transaction envelope by the ordering service — it is deterministic across all endorsing peers.

### AssetTransferred event
`TransferAsset` emits a Fabric chaincode event named `AssetTransferred`.  Phase 2 can subscribe to this event stream to get real-time ownership change notifications without polling `GetAssetHistory`.

### GetAssetHistory
Uses `ctx.stub.getHistoryForKey()` which returns every historical state of the key, including deletions.  Each entry includes the Fabric `txId` and timestamp.  This is the primary evidence feed for the Phase 3 investigation agents.

---

## Sample workflow

The `run-sample-workflow.sh` script executes:

```
Step 1  — Org1 creates SHIP-001 (status: CREATED)
Step 2  — Verify creation (ReadAsset)
Step 3  — Org1 transfers SHIP-001 → distributorUser@Org2MSP (status: IN_TRANSIT)
Step 4  — Org2 transfers SHIP-001 → bankUser@Org3MSP (status: IN_TRANSIT)
Step 5  — Org3 updates SHIP-001 status to DELIVERED
Step 6  — GetAssetHistory shows full provenance with tx IDs
Step 7  — GetAllAssets lists everything
```

---

## Phase 2 handoff checklist

Before Phase 2 starts, the following should be true:

- [ ] `bash fabric/scripts/install-fabric.sh` completes without error
- [ ] `bash fabric/scripts/start-network.sh` brings up all containers
- [ ] `bash fabric/scripts/deploy-chaincode.sh` commits chaincode successfully
- [ ] `bash fabric/scripts/run-sample-workflow.sh` shows asset history with real tx IDs
- [ ] GetAssetHistory returns entries with non-empty `txId` fields
- [ ] TransferAsset invocations appear as separate entries in the history

---

## Known limitations in Phase 1

1. **Org4 peer not added** — Transfer to retailerUser is recorded on-ledger but Org4 has no peer to endorse its own transactions.
2. **Admin identities used** — Production should use application-specific users enrolled via Fabric CA.
3. **Single orderer** — Sufficient for demo; not fault-tolerant.
4. **No TLS client auth** — The Gateway connection uses peer TLS server certificates only.
5. **No rich CouchDB queries** — `GetAllAssets` uses a range scan.  Phase 2 should add composite keys or CouchDB indexes.
