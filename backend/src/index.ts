import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { investigationRouter } from './routes/investigation.routes';
import { FabricClient } from './fabric/client';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', investigationRouter);

async function main() {
  const fabricClient = new FabricClient();
  const connected = await fabricClient.connect();

  if (connected) {
    console.log('✅ Connected to Fabric network.');
  } else {
    console.log('ℹ️ Running in DEMO_MODE with normalized Fabric evidence snapshot.');
  }

  app.listen(CONFIG.PORT, () => {
    console.log(`🚀 Sherloque Backend running on http://localhost:${CONFIG.PORT}`);
    console.log(`- Mode: ${CONFIG.DEMO_MODE ? 'DEMO_MODE' : 'LIVE_FABRIC'}`);
    console.log(`- AI Provider: ${CONFIG.OPENROUTER_API_KEY ? 'OpenRouter (LLaMA 3.1 8B)' : 'Deterministic Evidence Engine'}`);
  });
}

main().catch(err => {
  console.error('Fatal backend error:', err);
});
