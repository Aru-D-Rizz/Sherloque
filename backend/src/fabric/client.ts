import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Network, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { CONFIG } from '../config';

export class FabricClient {
  private gateway: Gateway | null = null;
  private network: Network | null = null;
  private contract: Contract | null = null;

  public async connect(): Promise<boolean> {
    if (CONFIG.DEMO_MODE) {
      console.log('[FabricClient] DEMO_MODE active. Using static/captured Fabric snapshot.');
      return false;
    }

    try {
      if (!fs.existsSync(CONFIG.FABRIC.TLS_CERT_PATH) || !fs.existsSync(CONFIG.FABRIC.IDENTITY_CERT_PATH)) {
        console.warn('[FabricClient] Fabric certificate files not found. Falling back to Demo Mode.');
        return false;
      }

      const tlsCert = fs.readFileSync(CONFIG.FABRIC.TLS_CERT_PATH);
      const tlsCredentials = grpc.credentials.createSsl(tlsCert);
      const client = new grpc.Client(
        `${CONFIG.FABRIC.GATEWAY_HOST}:${CONFIG.FABRIC.GATEWAY_PORT}`,
        tlsCredentials
      );

      const identityCert = fs.readFileSync(CONFIG.FABRIC.IDENTITY_CERT_PATH);
      const privateKeyPem = fs.readFileSync(CONFIG.FABRIC.IDENTITY_KEY_PATH);
      const privateKey = crypto.createPrivateKey(privateKeyPem);
      const signer = signers.newPrivateKeySigner(privateKey);

      this.gateway = connect({
        client,
        identity: {
          mspId: CONFIG.FABRIC.MSP_ID,
          credentials: identityCert,
        },
        signer,
      });

      this.network = this.gateway.getNetwork(CONFIG.FABRIC.CHANNEL_NAME);
      this.contract = this.network.getContract(CONFIG.FABRIC.CHAINCODE_NAME);
      console.log('[FabricClient] Connected to Hyperledger Fabric channel:', CONFIG.FABRIC.CHANNEL_NAME);
      return true;
    } catch (err) {
      console.error('[FabricClient] Connection failed:', err);
      return false;
    }
  }

  public getContract(): Contract | null {
    return this.contract;
  }

  public async close(): Promise<void> {
    if (this.gateway) {
      this.gateway.close();
      this.gateway = null;
    }
  }
}
