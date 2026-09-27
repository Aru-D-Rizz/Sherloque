# SHERLOQUE — Fabric Investigation Agent

**Autonomous Forensic Intelligence for Hyperledger Fabric Blockchains**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Aru--D--Rizz%2FSherloque-blue?logo=github)](https://github.com/Aru-D-Rizz/Sherloque)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Sherloque--Homes-black?logo=vercel)](https://vercel.com/alddd/sherloque-homes)

---

## 1. Project Overview

**Sherloque** is an autonomous blockchain investigation platform designed specifically for **Hyperledger Fabric**.

It allows an investigator to provide a Fabric transaction ID, asset ID, or identity target, and automatically reconstructs what happened across permissioned organizations on the ledger.

> **Core Principle:** AI must never invent blockchain evidence. Fabric is the source of truth.

```text
Hyperledger Fabric
        ↓
Transaction / Event Data
        ↓
Evidence Extraction (NFEO)
        ↓
Investigation Engine (Multi-Agent)
        ↓
Anomaly Analysis (Non-accusatory rules)
        ↓
Evidence Graph & Timeline
        ↓
Investigation Report
```

---

## 2. Architecture & Completed Phases

Sherloque is fully implemented across all 4 project phases:

```text
+-------------------------------------------------------------------------------+
|                             SHERLOQUE FRONTEND                                 |
|             Next.js 14 · React · Tailwind CSS · React Flow                    |
|       Landing · Evidence Graph · Timeline · Findings · Ask Q&A · Report       |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                       AGENTIC INVESTIGATION ENGINE                            |
|  InvestigationAgent · TransactionAgent · IdentityAgent · AssetAgent           |
|                AnomalyAgent · EvidenceAgent · AI Provider (LLaMA/Fallback)    |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                         INVESTIGATION BACKEND (APIs)                          |
|             Express · TypeScript · Normalized Evidence Objects (NFEO)         |
|     Transactions · Assets · Asset History · Identities · Related Txs · Events  |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                          HYPERLEDGER FABRIC NETWORK                           |
|        Channel: tradechannel · Chaincode: asset-transfer (TypeScript)        |
|        Orgs: Org1 (Manufacturer), Org2 (Distributor), Org3 (Bank) · CouchDB   |
+-------------------------------------------------------------------------------+
```

| Phase | Status | Details |
|---|---|---|
| **Phase 1 — Fabric Foundation** | ✅ Complete | Fabric 2.5.7, 3 orgs, CouchDB, `tradechannel`, TypeScript chaincode, asset history & events. |
| **Phase 2 — Investigation Backend** | ✅ Complete | Node.js + TypeScript Express server, Fabric Gateway integration, normalized evidence models (NFEO). |
| **Phase 3 — Investigation Engine** | ✅ Complete | Agentic architecture (Investigation, Transaction, Identity, Asset, Anomaly, Evidence agents), OpenRouter AI with deterministic fallback. |
| **Phase 4 — Sherloque Frontend** | ✅ Complete | Dark enterprise Next.js dashboard, React Flow evidence graph, asset timeline, findings panel, Ask Sherloque Q&A, markdown report export, DEMO MODE. |

---

## 3. Technology Stack

- **Blockchain Platform:** Hyperledger Fabric 2.5.7, Fabric CA 1.5.9, RAFT Orderer, CouchDB
- **Smart Contract (Chaincode):** TypeScript / Node.js (`asset-transfer`)
- **Backend Service:** Node.js, Express, TypeScript, `@hyperledger/fabric-gateway`, `@grpc/grpc-js`
- **Investigation Engine:** Multi-Agent Architecture, OpenRouter API (LLaMA 3.1 8B), Deterministic Evidence Engine fallback
- **Frontend UI:** Next.js 14, React 18, Tailwind CSS, React Flow graph visualization, Lucide icons
- **Deployment:** Vercel (Serverless Next.js API routes with Demo Mode snapshot fallback)

---

## 4. Normalized Forensic Evidence Objects (NFEO)

All investigation findings are anchored strictly in structured Fabric evidence objects:

```json
{
  "transactionId": "a7f3c2d1e8b94f6a2c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6",
  "blockNumber": 8,
  "timestamp": "2026-09-27T09:24:09.000Z",
  "channel": "tradechannel",
  "chaincode": "asset-transfer",
  "function": "TransferAsset",
  "creator": {
    "identity": "rogue-agent",
    "organization": "Org3",
    "msp": "Org3MSP"
  },
  "asset": {
    "id": "INVOICE-8391",
    "type": "INVOICE",
    "previousOwner": "distributor-clerk",
    "previousOrganization": "Org2MSP",
    "newOwner": "unknown-entity-7742",
    "newOrganization": "ExternalMSP",
    "status": "IN_TRANSIT"
  },
  "endorsers": ["Org3MSP"],
  "validationCode": "VALID"
}
```

---

## 5. Non-Accusatory Terminology Standard

In compliance with professional forensic investigation standards, Sherloque never auto-labels activity as "fraudulent" or "criminal".

Instead, it evaluates observed behavior against expected workflow baselines using evidence-backed terms:
- `anomaly`
- `unexpected transition`
- `workflow deviation`
- `elevated risk indicator`
- `requires review`

---

## 6. Quick Start & Local Development

### Prerequisites
- Node.js 18+
- Git
- Docker Desktop & WSL2 (only for running local Fabric network)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/Aru-D-Rizz/Sherloque.git
cd Sherloque

# 2. Copy environment file
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Start frontend development server
npm run frontend:dev
```

Open `http://localhost:3000` in your browser.

### Running Backend Server Separately
```bash
npm run backend:dev
```
Backend API will run at `http://localhost:3001/api/v1`.

### Running Local Fabric Network (Optional)
```bash
# Inside WSL 2 Ubuntu:
bash fabric/scripts/start-network.sh
bash fabric/scripts/deploy-chaincode.sh
bash fabric/scripts/run-sample-workflow.sh
```

---

## 7. Demo Mode vs Live Fabric Mode

Sherloque features a **Demo Mode** switch:
- `DEMO_MODE=true` (Default for Vercel): Uses a realistic, deterministic snapshot captured from Phase 1 Fabric transaction runs. Enables instant standalone public demonstrations on Vercel without local Docker/Fabric dependencies.
- `DEMO_MODE=false`: Connects directly to local/remote Hyperledger Fabric peers via gRPC Fabric Gateway.

To toggle modes, update `DEMO_MODE` in `.env`.

---

## 8. 3-Minute Hackathon Demo Script

For a live 3-minute hackathon presentation:

1. **Open Sherloque:** Visit [https://vercel.com/alddd/sherloque-homes](https://vercel.com/alddd/sherloque-homes) or `http://localhost:3000`.
2. **Launch Investigation:** Click on **`INV-8391 — Trade Finance Rogue Hijack`**.
3. **Inspect Overview:** Point out Target `INVOICE-8391`, Risk Level `CRITICAL RISK`, Channel `tradechannel`, and Chaincode `asset-transfer`.
4. **Interactive Evidence Graph:** Click tab `Evidence Graph`. Click node `tx-4` / `rogue-agent`. Show the right-hand transaction drawer displaying Block 8 raw payload and single-org endorsement breach.
5. **Asset Timeline:** Click tab `Timeline`. Show the step-by-step chronological audit trail (Block 5 to Block 8) with time badges.
6. **Findings & Workflow Comparison:** Click tab `Findings`. Show Expected vs Observed workflow comparison side-by-side, along with the 3 anomaly cards (Unauthorized Transfer, Velocity Outlier, Endorsement Mismatch) and recommendations.
7. **Ask Sherloque Q&A:** Click tab `Ask Sherloque`. Click suggested question *"Why was this transaction flagged?"* or ask *"Who initiated the anomalous transfer?"*. Highlight how answers cite real Fabric transaction IDs.
8. **Export Formal Report:** Click button **`📄 EXPORT REPORT`**. Click **`GENERATE INVESTIGATION REPORT`** to view and copy the markdown report.

---

## 9. Environment Variables

Reference `.env.example`:

```env
# DEMO MODE (default: true)
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true

# AI — OpenRouter (Optional — deterministic engine used if omitted)
OPENROUTER_API_KEY=

# Fabric Network (Local Fabric only)
CHANNEL_NAME=tradechannel
CHAINCODE_NAME=asset-transfer
FABRIC_GATEWAY_HOST=localhost
FABRIC_GATEWAY_PORT=7051
```

---

## 10. Links & Resources

- **GitHub Repository:** [https://github.com/Aru-D-Rizz/Sherloque](https://github.com/Aru-D-Rizz/Sherloque)
- **Vercel Public Demo:** [https://vercel.com/alddd/sherloque-homes](https://vercel.com/alddd/sherloque-homes)
- **Fabric Documentation:** [docs/phase1-fabric-foundation.md](file:///c:/Users/Aldrid/Desktop/Sherloque/docs/phase1-fabric-foundation.md)

---

*Built with IBM Bob 2.0 · Hyperledger Fabric 2.5.7 · Node.js · TypeScript · Next.js · React Flow*
