#!/usr/bin/env bash
# =============================================================================
# install-fabric.sh
#
# One-time script to download the official Hyperledger Fabric binaries,
# Docker images, and fabric-samples repository into fabric/network/.
#
# Run this ONCE before start-network.sh.
#
# Requirements:
#   • curl
#   • Docker running
#   • Internet access
#
# Fabric version: 2.5.x (LTS)
# =============================================================================
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

# ── checks ─────────────────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || die "Docker not found.  Install Docker Desktop and start it."
command -v curl   >/dev/null 2>&1 || die "curl not found."
command -v git    >/dev/null 2>&1 || die "git not found."

docker info >/dev/null 2>&1 || die "Docker daemon is not running.  Start Docker Desktop."

# ── download ───────────────────────────────────────────────────────────────────
mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

if [[ -d "fabric-samples" ]]; then
  warn "fabric-samples already exists — skipping clone."
else
  info "Cloning fabric-samples (tag v${FABRIC_VERSION})…"
  git clone --branch "v${FABRIC_VERSION}" --depth 1 \
    https://github.com/hyperledger/fabric-samples.git
fi

info "Downloading Fabric ${FABRIC_VERSION} binaries and Docker images…"
# The official bootstrap script places binaries in ./fabric-samples/bin/
curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh \
  | bash -s -- --fabric-version "${FABRIC_VERSION}" \
               --ca-version "${FABRIC_CA_VERSION}" \
               binary docker samples 2>&1

info "Fabric binaries installed."
info "Docker images pulled."
info ""
info "Installation complete.  Run: bash fabric/scripts/start-network.sh"
