#!/usr/bin/env bash
# =============================================================================
# deploy-chaincode.sh
#
# Packages, installs, approves, and commits the Sherloque asset-transfer
# chaincode on all three organisations.
#
# Must be run AFTER start-network.sh.
#
# Usage:
#   bash fabric/scripts/deploy-chaincode.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${REPO_ROOT}/fabric/network/fabric-samples/test-network"
CHAINCODE_DIR="${REPO_ROOT}/fabric/chaincode/asset-transfer"
CHANNEL_NAME="tradechannel"
CC_NAME="asset-transfer"
CC_VERSION="1.0"
CC_SEQUENCE="1"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[sherloque]${NC} $*"; }
warn() { echo -e "${YELLOW}[sherloque]${NC} $*"; }
die()  { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

[[ -d "${TEST_NETWORK_DIR}" ]] || die "fabric-samples not found.  Run install-fabric.sh first."

# ── Build chaincode ─────────────────────────────────────────────────────────
info "Building TypeScript chaincode…"
cd "${CHAINCODE_DIR}"
npm install --legacy-peer-deps
npm run build
info "Chaincode built."

# ── Deploy via test-network helper ──────────────────────────────────────────
info "Deploying chaincode '${CC_NAME}' on channel '${CHANNEL_NAME}'…"
cd "${TEST_NETWORK_DIR}"

./network.sh deployCC \
  -ccn "${CC_NAME}" \
  -ccp "${CHAINCODE_DIR}" \
  -ccl node \
  -ccv "${CC_VERSION}" \
  -ccs "${CC_SEQUENCE}" \
  -c  "${CHANNEL_NAME}"

info ""
info "Chaincode deployed successfully."
info "  Name    : ${CC_NAME}"
info "  Version : ${CC_VERSION}"
info "  Channel : ${CHANNEL_NAME}"
info ""
info "Next step: bash fabric/scripts/run-sample-workflow.sh"
