#!/usr/bin/env bash
# =============================================================================
# stop-network.sh
#
# Gracefully stops the Fabric network and removes containers.
# Does NOT delete crypto material or channel artifacts so the network
# can be restarted quickly with start-network.sh.
#
# To do a full teardown (including crypto), use reset-network.sh.
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${REPO_ROOT}/fabric/network/fabric-samples/test-network"

GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[sherloque]${NC} $*"; }
die()  { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

[[ -d "${TEST_NETWORK_DIR}" ]] || \
  die "fabric-samples not found.  Run: bash fabric/scripts/install-fabric.sh"

info "Stopping Fabric network…"
cd "${TEST_NETWORK_DIR}"
./network.sh down
info "Network stopped."
