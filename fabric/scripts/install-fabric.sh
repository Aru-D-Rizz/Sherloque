#!/usr/bin/env bash
set -euo pipefail

FABRIC_VERSION="2.5.7"
FABRIC_CA_VERSION="1.5.9"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INSTALL_DIR="${REPO_ROOT}/fabric/network"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[sherloque]${NC} $*"; }
warn() { echo -e "${YELLOW}[sherloque]${NC} $*"; }
die()  { echo -e "${RED}[sherloque] ERROR:${NC} $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "Docker not found."
command -v curl   >/dev/null 2>&1 || die "curl not found."
command -v git    >/dev/null 2>&1 || die "git not found."
docker info >/dev/null 2>&1       || die "Docker daemon is not running."

mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

# fabric-samples does not publish v2.5.x tags.
# The official approach is to clone main and use the install-fabric.sh
# bootstrap to pin the exact binary + image versions.
if [[ -d "fabric-samples/.git" ]]; then
  warn "fabric-samples already exists ? skipping clone."
else
  info "Cloning fabric-samples (main branch)..."
  git clone --depth 1 https://github.com/hyperledger/fabric-samples.git
fi

info "Downloading Fabric ${FABRIC_VERSION} binaries and Docker images..."
info "This will take several minutes on first run (pulling ~1.5 GB of images)."
info "(You will see Docker pull progress below)"

# The official Hyperledger bootstrap script ? downloads binaries into
# fabric-samples/bin/ and pulls all required Docker images.
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh \
  | bash -s -- \
      --fabric-version "${FABRIC_VERSION}" \
      --ca-version "${FABRIC_CA_VERSION}" \
      binary docker

info ""
info "============================================="
info " Fabric installation complete."
info "  Version    : ${FABRIC_VERSION}"
info "  CA Version : ${FABRIC_CA_VERSION}"
info "  Binaries   : ${INSTALL_DIR}/fabric-samples/bin/"
info "============================================="
info ""
info "Verify with:"
info "  ${INSTALL_DIR}/fabric-samples/bin/peer version"
info ""
info "Next step: bash fabric/scripts/start-network.sh"
