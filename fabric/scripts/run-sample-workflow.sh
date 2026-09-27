#!/usr/bin/env bash
# =============================================================================
# run-sample-workflow.sh
#
# Executes the complete Manufacturer → Distributor → Bank → Retailer
# supply-chain workflow.
#
# Demonstrates:
#   1. Manufacturer (Org1) creates a shipment.
#   2. Manufacturer transfers shipment to Distributor (Org2).
#   3. Distributor transfers shipment to Bank (Org3).
#   4. Bank marks shipment as DELIVERED (simulating Retailer receipt).
#   5. Asset history is retrieved to show full provenance.
#
# Run AFTER deploy-chaincode.sh.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${REPO_ROOT}/fabric/network/fabric-samples/test-network"
FABRIC_BIN="${REPO_ROOT}/fabric/network/fabric-samples/bin"
FABRIC_CFG="${TEST_NETWORK_DIR}/config"

CHANNEL_NAME="tradechannel"
CC_NAME="asset-transfer"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[sherloque]${NC} $*"; }
step()    { echo -e "${CYAN}[step]${NC} $*"; }
warn()    { echo -e "${YELLOW}[sherloque]${NC} $*"; }
die()     { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

[[ -d "${TEST_NETWORK_DIR}" ]] || die "fabric-samples not found."
export PATH="${FABRIC_BIN}:${PATH}"
export FABRIC_CFG_PATH="${FABRIC_CFG}"

# ── Org1 environment (Manufacturer / peer0.org1) ─────────────────────────────
setOrg1() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org1MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
  export CORE_PEER_ADDRESS="localhost:7051"
}

# ── Org2 environment (Distributor / peer0.org2) ──────────────────────────────
setOrg2() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org2MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
  export CORE_PEER_ADDRESS="localhost:9051"
}

# ── Org3 environment (Bank / peer0.org3) ─────────────────────────────────────
setOrg3() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="Org3MSP"
  export CORE_PEER_TLS_ROOTCERT_FILE="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp"
  export CORE_PEER_ADDRESS="localhost:11051"
}

ORDERER_CA="${TEST_NETWORK_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# ─────────────────────────────────────────────────────────────────────────────
step "1 — Manufacturer (Org1) creates shipment SHIP-001"
# ─────────────────────────────────────────────────────────────────────────────
setOrg1
peer chaincode invoke \
  -o "localhost:7050" \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "${ORDERER_CA}" \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"CreateAsset","Args":["SHIP-001","SHIPMENT","Electronic components from Manufacturer","{\"origin\":\"FactoryA\",\"weight\":\"150kg\",\"hazardous\":\"false\"}"]}'
sleep 3

info "Shipment SHIP-001 created."

# ─────────────────────────────────────────────────────────────────────────────
step "2 — Verify creation: ReadAsset SHIP-001"
# ─────────────────────────────────────────────────────────────────────────────
setOrg1
peer chaincode query \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  -c '{"function":"ReadAsset","Args":["SHIP-001"]}' | python3 -m json.tool 2>/dev/null || \
peer chaincode query \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  -c '{"function":"ReadAsset","Args":["SHIP-001"]}'

# ─────────────────────────────────────────────────────────────────────────────
step "3 — Manufacturer transfers SHIP-001 to Distributor (Org2)"
# ─────────────────────────────────────────────────────────────────────────────
setOrg1
peer chaincode invoke \
  -o "localhost:7050" \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "${ORDERER_CA}" \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"TransferAsset","Args":["SHIP-001","distributorUser","Org2MSP"]}'
sleep 3

info "SHIP-001 transferred to distributorUser@Org2MSP."

# ─────────────────────────────────────────────────────────────────────────────
step "4 — Distributor transfers SHIP-001 to Bank (Org3)"
# ─────────────────────────────────────────────────────────────────────────────
setOrg2
peer chaincode invoke \
  -o "localhost:7050" \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "${ORDERER_CA}" \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"TransferAsset","Args":["SHIP-001","bankUser","Org3MSP"]}'
sleep 3

info "SHIP-001 transferred to bankUser@Org3MSP."

# ─────────────────────────────────────────────────────────────────────────────
step "5 — Bank marks SHIP-001 as DELIVERED"
# ─────────────────────────────────────────────────────────────────────────────
setOrg3
peer chaincode invoke \
  -o "localhost:7050" \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "${ORDERER_CA}" \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"UpdateAsset","Args":["SHIP-001","","DELIVERED","{}"]}'
sleep 3

info "SHIP-001 marked DELIVERED."

# ─────────────────────────────────────────────────────────────────────────────
step "6 — Retrieve full asset history (provenance chain)"
# ─────────────────────────────────────────────────────────────────────────────
setOrg1
info "=== Asset History for SHIP-001 ==="
peer chaincode query \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  -c '{"function":"GetAssetHistory","Args":["SHIP-001"]}' | python3 -m json.tool 2>/dev/null || \
peer chaincode query \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  -c '{"function":"GetAssetHistory","Args":["SHIP-001"]}'

# ─────────────────────────────────────────────────────────────────────────────
step "7 — List all assets"
# ─────────────────────────────────────────────────────────────────────────────
setOrg1
info "=== All Assets ==="
peer chaincode query \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  -c '{"function":"GetAllAssets","Args":[]}' | python3 -m json.tool 2>/dev/null || \
peer chaincode query \
  -C "${CHANNEL_NAME}" -n "${CC_NAME}" \
  -c '{"function":"GetAllAssets","Args":[]}'

info ""
info "══════════════════════════════════════════════════════════════════════"
info " Phase 1 sample workflow COMPLETE."
info " Workflow executed:"
info "   Manufacturer (Org1) ──► Distributor (Org2) ──► Bank (Org3)"
info ""
info " Phase 2 integration point:"
info "   The investigation backend can now retrieve real transaction IDs,"
info "   block numbers, timestamps, and creator identities for all of the"
info "   above transactions via the Fabric Gateway API."
info "══════════════════════════════════════════════════════════════════════"
