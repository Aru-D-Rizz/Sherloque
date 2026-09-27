import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 3001,
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  FABRIC: {
    CHANNEL_NAME: process.env.CHANNEL_NAME || 'tradechannel',
    CHAINCODE_NAME: process.env.CHAINCODE_NAME || 'asset-transfer',
    GATEWAY_HOST: process.env.FABRIC_GATEWAY_HOST || 'localhost',
    GATEWAY_PORT: parseInt(process.env.FABRIC_GATEWAY_PORT || '7051', 10),
    MSP_ID: process.env.ORG1_MSP_ID || 'Org1MSP',
    TLS_CERT_PATH: process.env.FABRIC_TLS_CERT_PATH || '',
    IDENTITY_CERT_PATH: process.env.FABRIC_IDENTITY_CERT_PATH || '',
    IDENTITY_KEY_PATH: process.env.FABRIC_IDENTITY_KEY_PATH || '',
  },
};
