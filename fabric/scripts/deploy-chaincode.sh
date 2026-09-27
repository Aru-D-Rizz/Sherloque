#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${REPO_ROOT}/fabric/network/fabric-samples/test-network"
# Windows /mnt/c path for source files
CHAINCODE_SRC_WIN="${REPO_ROOT}/fabric/chaincode/asset-transfer"
# Linux-native build directory (avoids npm node_modules on /mnt/c/ permission issues)
CHAINCODE_BUILD_DIR="/root/sherloque-chaincode/asset-transfer"
FABRIC_BIN="${REPO_ROOT}/fabric/network/fabric-samples/bin"
CHANNEL_NAME="tradechannel"
CC_NAME="asset-transfer"
CC_VERSION="1.0"
CC_SEQUENCE="1"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[sherloque]${NC} $*"; }
die()  { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

[[ -d "${TEST_NETWORK_DIR}" ]] || die "fabric-samples not found."
command -v node >/dev/null 2>&1 || die "node not found. Install Node.js 20 LTS."

export PATH="${FABRIC_BIN}:${PATH}"
export FABRIC_CFG_PATH="${TEST_NETWORK_DIR}/config"

# Sync source to Linux-native directory so npm install works correctly.
# The deployCC script will run npm install + npm run build itself when
# -ccl typescript is used.
info "Syncing chaincode source to Linux-native build directory..."
mkdir -p "${CHAINCODE_BUILD_DIR}/src"
cp -r "${CHAINCODE_SRC_WIN}/src/."    "${CHAINCODE_BUILD_DIR}/src/"
cp    "${CHAINCODE_SRC_WIN}/package.json"  "${CHAINCODE_BUILD_DIR}/"
cp    "${CHAINCODE_SRC_WIN}/tsconfig.json" "${CHAINCODE_BUILD_DIR}/"
info "Source synced to ${CHAINCODE_BUILD_DIR}"

info "Deploying chaincode (language: typescript)..."
info "  The deployCC script will run npm install + tsc automatically."
cd "${TEST_NETWORK_DIR}"

./network.sh deployCC \
  -ccn "${CC_NAME}" \
  -ccp "${CHAINCODE_BUILD_DIR}" \
  -ccl typescript \
  -ccv "${CC_VERSION}" \
  -ccs "${CC_SEQUENCE}" \
  -c  "${CHANNEL_NAME}"

info ""
info "============================================="
info " Chaincode deployed successfully."
info "  Name    : ${CC_NAME}"
info "  Version : ${CC_VERSION}"
info "  Channel : ${CHANNEL_NAME}"
info "  Language: TypeScript (Node.js runtime)"
info "============================================="
info ""
info "Next step: bash fabric/scripts/run-sample-workflow.sh"
