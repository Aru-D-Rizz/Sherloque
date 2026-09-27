# Sherloque

**Autonomous Hyperledger Fabric Investigation Platform**

Sherloque is a hackathon project that allows an investigator to enter a Fabric transaction ID, asset ID, identity, or other target and have the platform reconstruct what happened across a permissioned Hyperledger Fabric network.

---

## Table of Contents

1. [Project Purpose](#1-project-purpose)
2. [Architecture Overview](#2-architecture-overview)
3. [Fabric Network Topology](#3-fabric-network-topology)
4. [Organizations](#4-organizations)
5. [Identity Model](#5-identity-model)
6. [Channel](#6-channel)
7. [Chaincode](#7-chaincode)
8. [Asset Model](#8-asset-model)
9. [Prerequisites](#9-prerequisites)
10. [How to Start the Network](#10-how-to-start-the-network)
11. [How to Stop the Network](#11-how-to-stop-the-network)
12. [How to Deploy Chaincode](#12-how-to-deploy-chaincode)
13. [How to Create Assets](#13-how-to-create-assets)
14. [How to Transfer Assets](#14-how-to-transfer-assets)
15. [How to Query Assets](#15-how-to-query-assets)
16. [How to Retrieve Asset History](#16-how-to-retrieve-asset-history)
17. [How to Reset the Network](#17-how-to-reset-the-network)
18. [Troubleshooting](#18-troubleshooting)
19. [Phase 2 Integration Points](#19-phase-2-integration-points)
20. [Development Phases](#20-development-phases)

---

## 1. Project Purpose

Sherloque investigates activity on a Hyperledger Fabric permissioned blockchain and generates evidence-backed investigation reports.

The key principle is that **Fabric is the source of truth**. AI agents reason over structured evidence retrieved from Fabric — they never invent transactions, identities, or asset states.

---

## 2. Architecture Overview

```
                         SHERLOQUE
                             │
                    Investigation Agent          ← Phase 3
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   Transaction Agent   Identity Agent     Asset Agent
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
                      Anomaly Agent
                             │
                             ▼
                      Evidence Agent
                             │
                             ▼
                  Investigation Report

───────────────────────────────────────────────────

Hyperledger Fabric                               ← Phase 1 (current)
        ↓
Fabric Gateway / APIs                            ← Phase 2
        ↓
Investigation Backend
        ↓
Normalized Evidence
        ↓
AI Agents                                        ← Phase 3
        ↓
Investigation Findings

Frontend (Next.js / React Flow)                  ← Phase 4
```

---

## 3. Fabric Network Topology

```
                    ┌───────────────┐
                    │    Orderer    │
                    │ (RAFT, 1 node)│
                    └───────┬───────┘
                            │
                       tradechannel
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
       ▼                    ▼                    ▼
     Org1                  Org2                 Org3
 Manufacturer           Distributor              Bank
       │                    │                    │
  peer0.org1           peer0.org2           peer0.org3
  (port 7051)          (port 9051)          (port 11051)
       │                    │                    │
       │            CouchDB state DB             │
       └────────────────────┼────────────────────┘
                            │
               (Org4 — Retailer: Phase 1.1)
```

> **Note on Org4:** The test-network bootstrap supports three organizations natively. Org4 (Retailer) will be introduced in a follow-up step once the three-org network is stable. The `TransferAsset` function already accepts any `newOwner`/`newOrganization` string, so the Retailer can participate as a transfer target before its own peer joins the channel.

**Ports:**

| Service | Port |
|---|---|
| peer0.org1 | 7051 |
| peer0.org2 | 9051 |
| peer0.org3 | 11051 |
| orderer | 7050 |
| CA Org1 | 7054 |
| CA Org2 | 8054 |
| CA Org3 | 11054 |
| CouchDB Org1 | 5984 |
| CouchDB Org2 | 7984 |
| CouchDB Org3 | 9984 |

---

## 4. Organizations

| ID | MSP ID | Role | Peer Port |
|---|---|---|---|
| Org1 | Org1MSP | Manufacturer | 7051 |
| Org2 | Org2MSP | Distributor | 9051 |
| Org3 | Org3MSP | Bank | 11051 |
| Org4 | Org4MSP | Retailer | TBD (Phase 1.1) |

---

## 5. Identity Model

Fabric uses **X.509 certificates** issued by each organization's **Fabric CA**.

The test-network creates the following identities automatically:

| Identity | MSP | Role |
|---|---|---|
| Admin@org1.example.com | Org1MSP | Org1 admin |
| Admin@org2.example.com | Org2MSP | Org2 admin |
| Admin@org3.example.com | Org3MSP | Org3 admin |

The sample workflow uses these admin identities as proxies for:
- `manufacturerUser` (Org1)
- `distributorUser` (Org2)
- `bankUser` (Org3)

Phase 2 should register dedicated application users via Fabric CA enrollment.

The chaincode extracts the caller's CN from `ctx.clientIdentity.getID()` and their MSP via `ctx.clientIdentity.getMSPID()` so every transaction is stamped with the real submitter identity.

---

## 6. Channel

| Property | Value |
|---|---|
| Channel name | `tradechannel` |
| Members | Org1MSP, Org2MSP, Org3MSP |
| State DB | CouchDB |

---

## 7. Chaincode

**Language:** TypeScript (Node.js)

**Rationale:** TypeScript aligns with the planned Phase 2 Node.js backend so the `@sherloque/shared` types package can be shared between the chaincode and the investigation backend without translation.

**Location:** `fabric/chaincode/asset-transfer/`

**Deployed name:** `asset-transfer`

**Functions:**

| Function | Arguments | Description |
|---|---|---|
| `CreateAsset` | id, assetType, description, metadataJSON | Creates a new asset; owner is derived from caller identity |
| `ReadAsset` | id | Returns the current asset state |
| `UpdateAsset` | id, description, newStatus, metadataJSON | Updates description/status/metadata |
| `TransferAsset` | id, newOwner, newOrganization | Changes ownership; emits `AssetTransferred` event |
| `DeleteAsset` | id | Removes asset from active state (history preserved) |
| `AssetExists` | id | Returns "true"/"false" |
| `GetAssetHistory` | id | Returns full provenance chain with tx IDs and timestamps |
| `GetAllAssets` | — | Returns summary list of all assets |

---

## 8. Asset Model

```json
{
  "id": "SHIP-001",
  "type": "SHIPMENT",
  "description": "Electronic components from Manufacturer",
  "owner": "Admin",
  "ownerOrganization": "Org1MSP",
  "status": "CREATED",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "origin": "FactoryA",
    "weight": "150kg",
    "hazardous": "false"
  }
}
```

**Asset types:** `SHIPMENT` | `INVOICE` | `PURCHASE_ORDER`

**Statuses:** `CREATED` | `IN_TRANSIT` | `DELIVERED` | `CANCELLED`

---

## 9. Prerequisites

### Required on your machine

| Tool | Minimum version | Check |
|---|---|---|
| Docker Desktop | 24.x | `docker --version` |
| Docker Compose | v2.x | `docker compose version` |
| Node.js | 18.x | `node --version` |
| Git | 2.x | `git --version` |
| WSL 2 (Windows) | — | `wsl --status` |

> **Windows users:** All Fabric scripts must be run inside **WSL 2** (Ubuntu recommended). Docker Desktop must have "Use the WSL 2 based engine" enabled.

### One-time setup

```bash
# 1. Clone the repository
git clone https://github.com/Aru-D-Rizz/Sherloque.git
cd Sherloque

# 2. Copy environment file
cp .env.example .env

# 3. Download Fabric binaries and Docker images (run inside WSL)
bash fabric/scripts/install-fabric.sh
```

---

## 10. How to Start the Network

```bash
# Run inside WSL
bash fabric/scripts/start-network.sh
```

This will:
1. Pull all required Fabric Docker images (first run only)
2. Start orderer + 3 peers + 3 CAs + 3 CouchDB instances
3. Create the `tradechannel` channel
4. Join all three peers to the channel

---

## 11. How to Stop the Network

```bash
bash fabric/scripts/stop-network.sh
```

Containers are removed but crypto material is preserved so the next `start-network.sh` is faster.

---

## 12. How to Deploy Chaincode

```bash
bash fabric/scripts/deploy-chaincode.sh
```

This will:
1. `npm install` the chaincode dependencies
2. Compile TypeScript to JavaScript
3. Package the chaincode
4. Install on all three peers
5. Approve from each organization
6. Commit to the channel

---

## 13. How to Create Assets

```bash
# Set Org1 environment variables (see run-sample-workflow.sh for full env)
peer chaincode invoke \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile <orderer-ca-cert> \
  -C tradechannel -n asset-transfer \
  --peerAddresses localhost:7051 --tlsRootCertFiles <org1-peer-tls> \
  --peerAddresses localhost:9051 --tlsRootCertFiles <org2-peer-tls> \
  -c '{"function":"CreateAsset","Args":["SHIP-001","SHIPMENT","My shipment","{}"]}'
```

---

## 14. How to Transfer Assets

```bash
peer chaincode invoke \
  ... \
  -c '{"function":"TransferAsset","Args":["SHIP-001","distributorUser","Org2MSP"]}'
```

---

## 15. How to Query Assets

```bash
# Read a single asset
peer chaincode query -C tradechannel -n asset-transfer \
  -c '{"function":"ReadAsset","Args":["SHIP-001"]}'

# List all assets
peer chaincode query -C tradechannel -n asset-transfer \
  -c '{"function":"GetAllAssets","Args":[]}'
```

---

## 16. How to Retrieve Asset History

```bash
peer chaincode query -C tradechannel -n asset-transfer \
  -c '{"function":"GetAssetHistory","Args":["SHIP-001"]}'
```

Returns an array of history entries, each containing:
- `txId` — the Fabric transaction ID
- `timestamp` — ISO-8601 Fabric transaction timestamp
- `value` — full asset state at that point
- `isDelete` — true if this was a deletion

---

## 17. How to Reset the Network

```bash
bash fabric/scripts/reset-network.sh
```

> ⚠️ **This deletes all ledger data.** You will need to re-run `start-network.sh` and `deploy-chaincode.sh`.

---

## 18. Troubleshooting

### Docker daemon not running
```
docker : failed to connect to the docker API
```
**Fix:** Start Docker Desktop and wait for it to fully start.

### WSL not installed
**Fix:** `wsl --install -d Ubuntu` in PowerShell (admin), then reboot.

### Fabric binaries not found
```
peer: command not found
```
**Fix:** Run `bash fabric/scripts/install-fabric.sh` first.

### Channel already exists
**Fix:** Run `bash fabric/scripts/reset-network.sh` then start again.

### Chaincode endorsement failures
Ensure at least two peers are reachable when invoking (the default endorsement policy requires Org1 and Org2).

### CouchDB port conflict
If port 5984 is in use: stop any local CouchDB instances before starting the network.

---

## 19. Phase 2 Integration Points

The Phase 2 investigation backend will connect to this Fabric network using the **Fabric Gateway** SDK (`@hyperledger/fabric-gateway`).

Key integration points:

| Evidence | Source | Fabric API |
|---|---|---|
| Transaction ID | Every invoke response | `submitTransaction()` return value |
| Block number | Block events | `BlockEventsOptions` |
| Timestamp | Block header | `BlockHeader.data_hash` metadata |
| Creator identity | Transaction envelope | `SignatureHeader.creator` |
| Creator MSP | Transaction envelope | `SignatureHeader.creator.mspid` |
| Asset state | ReadAsset | `evaluateTransaction()` |
| Asset history | GetAssetHistory | `evaluateTransaction()` |
| Chaincode events | AssetTransferred | `ChaincodeEventsOptions` |

The connection profile for Org1 is located at:
```
fabric/network/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
```

---

## 20. Development Phases

| Phase | Status | Description |
|---|---|---|
| Phase 1 | ✅ Current | Fabric Foundation — network, chaincode, sample data |
| Phase 2 | Planned | Investigation Backend — Fabric Gateway, evidence layer |
| Phase 3 | Planned | AI Investigation Engine — agents, anomaly detection |
| Phase 4 | Planned | Frontend — Next.js, React Flow, investigation dashboard |

---

*Sherloque — Autonomous Hyperledger Fabric Investigation Platform*
