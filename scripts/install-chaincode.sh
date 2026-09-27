#!/usr/bin/env bash
set -euo pipefail
TN="/mnt/c/Users/Aldrid/Desktop/Sherloque/fabric/network/fabric-samples/test-network"
BIN="/mnt/c/Users/Aldrid/Desktop/Sherloque/fabric/network/fabric-samples/bin"
export PATH="$BIN:$PATH"
export FABRIC_CFG_PATH="$TN/config"
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
