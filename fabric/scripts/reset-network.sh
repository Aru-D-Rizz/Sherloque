#!/usr/bin/env bash
# =============================================================================
# reset-network.sh
#
# Full teardown: stops the network AND removes all generated crypto,
# channel artifacts, and CouchDB data so you get a completely clean
# environment on the next start-network.sh run.
#
# WARNING: all ledger data will be lost.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${REPO_ROOT}/fabric/network/fabric-samples/test-network"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[sherloque]${NC} $*"; }
warn() { echo -e "${YELLOW}[sherloque]${NC} $*"; }
die()  { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

[[ -d "${TEST_NETWORK_DIR}" ]] || die "fabric-samples not found."

warn "This will delete ALL ledger data.  Press Ctrl-C within 5 seconds to abort."
sleep 5

info "Tearing down Fabric network…"
cd "${TEST_NETWORK_DIR}"
./network.sh down

info "Removing generated crypto material…"
rm -rf "${TEST_NETWORK_DIR}/organizations/peerOrganizations"
rm -rf "${TEST_NETWORK_DIR}/organizations/ordererOrganizations"
rm -rf "${TEST_NETWORK_DIR}/channel-artifacts"

info "Pruning unused Docker volumes…"
docker volume prune -f 2>/dev/null || true

info "Reset complete.  Run: bash fabric/scripts/start-network.sh"
