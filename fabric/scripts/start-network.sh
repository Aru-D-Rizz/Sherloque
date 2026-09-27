#!/usr/bin/env bash
# =============================================================================
# start-network.sh
#
# Starts the Sherloque Hyperledger Fabric network using the official
# fabric-samples test-network as the base.
#
# Prerequisites (run once):
#   bash fabric/scripts/install-fabric.sh
#
# What this script does:
#   1. Brings up the test-network with 3 organisations (Org1, Org2, Org3)
#      using the CA-based identity model.
#   2. Creates the channel "tradechannel".
#   3. Joins all three peers to the channel.
#
# Usage:
#   bash fabric/scripts/start-network.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
FABRIC_SAMPLES_DIR="${REPO_ROOT}/fabric/network/fabric-samples"
TEST_NETWORK_DIR="${FABRIC_SAMPLES_DIR}/test-network"

CHANNEL_NAME="tradechannel"

# ── Colour helpers ─────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[sherloque]${NC} $*"; }
warn()    { echo -e "${YELLOW}[sherloque]${NC} $*"; }
die()     { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

# ── Sanity checks ──────────────────────────────────────────────────────────────
command -v docker  >/dev/null 2>&1 || die "docker is not installed or not on PATH"
command -v docker-compose >/dev/null 2>&1 || \
  docker compose version >/dev/null 2>&1    || die "docker compose is not available"

[[ -d "${TEST_NETWORK_DIR}" ]] || \
  die "fabric-samples not found at ${TEST_NETWORK_DIR}.  Run: bash fabric/scripts/install-fabric.sh"

# ── Start network ──────────────────────────────────────────────────────────────
info "Starting Fabric test-network (3 orgs, Fabric CA)…"
cd "${TEST_NETWORK_DIR}"

./network.sh down 2>/dev/null || true   # clean slate

./network.sh up createChannel \
  -ca \
  -c "${CHANNEL_NAME}" \
  -s couchdb

info "Network is up.  Channel: ${CHANNEL_NAME}"
info "Peers joined:"
info "  peer0.org1.example.com  (Org1 — Manufacturer)"
info "  peer0.org2.example.com  (Org2 — Distributor)"
info "  peer0.org3.example.com  (Org3 — Bank)"
info ""
info "Next step: bash fabric/scripts/deploy-chaincode.sh"
