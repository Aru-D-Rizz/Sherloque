#!/usr/bin/env python3
"""Writes install-chaincode.sh to /root/ in WSL with no escaping issues."""
script = r"""#!/usr/bin/env bash
set -euo pipefail

TN="/mnt/c/Users/Aldrid/Desktop/Sherloque/fabric/network/fabric-samples/test-network"
BIN="/mnt/c/Users/Aldrid/Desktop/Sherloque/fabric/network/fabric-samples/bin"
FS="/mnt/c/Users/Aldrid/Desktop/Sherloque/fabric/network/fabric-samples"
export PATH="$BIN:$PATH"
export FABRIC_CFG_PATH="$FS/config"
PKG="$TN/asset-transfer.tar.gz"
ORDERER_CA="$TN/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

setOrg1() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID=Org1MSP
  export CORE_PEER_TLS_ROOTCERT_FILE="$TN/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="$TN/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
  export CORE_PEER_ADDRESS=localhost:7051
}
setOrg2() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID=Org2MSP
  export CORE_PEER_TLS_ROOTCERT_FILE="$TN/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="$TN/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
  export CORE_PEER_ADDRESS=localhost:9051
}
setOrg3() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID=Org3MSP
  export CORE_PEER_TLS_ROOTCERT_FILE="$TN/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="$TN/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp"
  export CORE_PEER_ADDRESS=localhost:11051
}

echo "[1/6] Installing on peer0.org1..."
setOrg1
peer lifecycle chaincode install "$PKG"

echo "[2/6] Installing on peer0.org2..."
setOrg2
peer lifecycle chaincode install "$PKG"

echo "[3/6] Installing on peer0.org3..."
setOrg3
peer lifecycle chaincode install "$PKG"

echo "Querying installed chaincode package ID..."
setOrg1
PKGID=$(peer lifecycle chaincode queryinstalled --output json \
  | python3 -c "import json,sys; data=json.load(sys.stdin); pkgs=data.get('installed_chaincodes',[]); match=[p['package_id'] for p in pkgs if p.get('label','').startswith('asset-transfer')]; print(match[0])")
echo "Package ID: $PKGID"

echo "[4/6] Approving for Org1..."
setOrg1
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "$ORDERER_CA" \
  --channelID tradechannel --name asset-transfer \
  --version 1.0 --sequence 1 \
  --package-id "$PKGID"

echo "[5/6] Approving for Org2..."
setOrg2
peer lifecycle chaincode approveformyorg \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "$ORDERER_CA" \
  --channelID tradechannel --name asset-transfer \
  --version 1.0 --sequence 1 \
  --package-id "$PKGID"

echo "Checking commit readiness..."
setOrg1
peer lifecycle chaincode checkcommitreadiness \
  --channelID tradechannel --name asset-transfer \
  --version 1.0 --sequence 1 --output json

echo "[6/6] Committing chaincode definition..."
setOrg1
peer lifecycle chaincode commit \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  --tls --cafile "$ORDERER_CA" \
  --channelID tradechannel --name asset-transfer \
  --version 1.0 --sequence 1 \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "$TN/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "$TN/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

echo ""
echo "============================================="
echo " Chaincode committed to tradechannel."
echo " Name    : asset-transfer v1.0 seq 1"
echo " Next    : bash fabric/scripts/run-sample-workflow.sh"
echo "============================================="
"""

with open('/root/install-chaincode.sh', 'w') as f:
    f.write(script)

import os
os.chmod('/root/install-chaincode.sh', 0o755)
print("Written /root/install-chaincode.sh")
