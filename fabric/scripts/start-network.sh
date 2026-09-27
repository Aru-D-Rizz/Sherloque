#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${REPO_ROOT}/fabric/network/fabric-samples/test-network"
FABRIC_BIN="${REPO_ROOT}/fabric/network/fabric-samples/bin"
CHANNEL_NAME="tradechannel"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[sherloque]${NC} $*"; }
warn() { echo -e "${YELLOW}[sherloque]${NC} $*"; }
die()  { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "Docker not found."
docker info >/dev/null 2>&1       || die "Docker daemon is not running."
[[ -d "${TEST_NETWORK_DIR}" ]]    || die "fabric-samples not found. Run: bash fabric/scripts/install-fabric.sh"

export PATH="${FABRIC_BIN}:${PATH}"
export FABRIC_CFG_PATH="${TEST_NETWORK_DIR}/config"

info "Tearing down any previous network..."
cd "${TEST_NETWORK_DIR}"
./network.sh down 2>/dev/null || true

info "Starting Fabric test-network (Org1 + Org2, Fabric CA, CouchDB)..."
./network.sh up createChannel \
  -ca \
  -c "${CHANNEL_NAME}" \
  -s couchdb

info ""
info "============================================="
info " Fabric network is UP."
info "  Channel : ${CHANNEL_NAME}"
info "  Orgs    : Org1 (Manufacturer), Org2 (Distributor)"
info "  DB      : CouchDB"
info "============================================="
info ""
info "Org3 (Bank) will be added via addOrg3 next."
info ""
info "Adding Org3 (Bank) to channel ${CHANNEL_NAME}..."
cd "${TEST_NETWORK_DIR}/addOrg3"
./addOrg3.sh up -c "${CHANNEL_NAME}" -s couchdb -ca

info ""
info "============================================="
info " All 3 organisations are on the channel."
info "  Org1 : Manufacturer  (peer0.org1 :7051)"
info "  Org2 : Distributor   (peer0.org2 :9051)"
info "  Org3 : Bank          (peer0.org3 :11051)"
info "============================================="
info ""
info "Next step: bash fabric/scripts/deploy-chaincode.sh"
