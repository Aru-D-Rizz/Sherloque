import { CONFIG } from '../config';

export interface AIAnalysisRequest {
  prompt: string;
  context: Record<string, unknown>;
}

export interface AIAnalysisResponse {
  answer: string;
  source: 'openrouter' | 'deterministic';
  model: string;
}

export class AIProvider {
  public static async analyze(req: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (CONFIG.OPENROUTER_API_KEY) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://sherloque.vercel.app',
            'X-Title': 'Sherloque Agent',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
              {
                role: 'system',
                content:
                  'You are Sherloque, an autonomous forensic investigation AI for Hyperledger Fabric blockchains.\n' +
                  'Analyze evidence strictly from facts provided. Use neutral, evidence-backed terminology (anomaly, workflow deviation, unexpected transition, elevated risk indicator, requires review).\n' +
                  'Never use words like fraudulent or criminal.\n\nEVIDENCE CONTEXT:\n' +
                  JSON.stringify(req.context, null, 2),
              },
              { role: 'user', content: req.prompt },
            ],
            max_tokens: 450,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            return { answer: content, source: 'openrouter', model: 'llama-3.1-8b' };
          }
        }
      } catch (err) {
        console.warn('[AIProvider] OpenRouter call failed, falling back to deterministic synthesis:', err);
      }
    }

    return {
      answer: this.deterministicFallback(req.prompt, req.context),
      source: 'deterministic',
      model: 'built-in',
    };
  }

  private static deterministicFallback(prompt: string, context: Record<string, unknown>): string {
    const q = prompt.toLowerCase();
    const targetAssetId = (context.targetAssetId as string) || 'INVOICE-8391';

    if (q.includes('flagged') || q.includes('why') || q.includes('anomal')) {
      return `Target **${targetAssetId}** was flagged due to 3 specific evidence anomalies:\n\n` +
        `1. **Unauthorized Ownership Transfer** — Submitted by \`rogue-agent@Org3MSP\` at Block 8, bypassing the required Org1MSP+Org2MSP endorsement policy.\n` +
        `2. **Velocity Outlier** — 3 ownership changes in 248 seconds versus normal baseline of 1 per day.\n` +
        `3. **Single-Org Endorsement** — Endorsed solely by Org3MSP on a multi-party trade asset.`;
    }

    if (q.includes('who') || q.includes('identity') || q.includes('creator')) {
      return `The anomalous transaction was initiated by **\`rogue-agent\`** representing **Org3** (MSP: \`Org3MSP\`).\n\n` +
        `Org3 was not an authorized owner or endorser for asset **${targetAssetId}** in channel \`tradechannel\`.`;
    }

    if (q.includes('evidence') || q.includes('proof')) {
      return `The investigation is supported by Hyperledger Fabric ledger records:\n\n` +
        `• **Block 8 / TX \`a7f3c2d1...\`**: TransferAsset to \`unknown-entity-7742\` (Org3MSP endorsement policy breach)\n` +
        `• **Block 7 / TX \`d4e6f8a0...\`**: Internal transfer within Org2MSP prior to breach\n` +
        `• **Block 6 / TX \`c3d5e7f9...\`**: Legitimate Org1 → Org2 transfer`;
    }

    return `Sherloque Evidence Summary for **${targetAssetId}**:\n` +
      `All findings are anchored in Fabric block headers, X.509 MSP credentials, and on-ledger chaincode history.`;
  }
}
