import { NextRequest, NextResponse } from 'next/server';
import { DEMO_INVESTIGATION } from '@/lib/demo-data';

const SYSTEM_PROMPT = `You are Sherloque, an autonomous forensic investigation AI for Hyperledger Fabric blockchains.
You have been given structured evidence from a real Fabric investigation. Answer questions based ONLY on the evidence provided.
Do not invent blockchain facts. If you cannot answer from the evidence, say so.
Use terminology: anomaly, unexpected transition, workflow deviation, elevated risk indicator, requires review.
Never say "fraudulent" or "criminal" — only describe what the evidence shows.
Keep answers concise and evidence-backed.`;

function deterministicAnswer(question: string, investigation: typeof DEMO_INVESTIGATION): string {
  const q = question.toLowerCase();
  const rogueTs = investigation.transactions[3];
  if (q.includes('flagged') || q.includes('suspicious') || q.includes('anomal')) {
    return `This investigation was flagged due to 3 anomalies detected in the evidence:\n\n1. **Unauthorized Transfer** — Transaction \`${rogueTs.transactionId.slice(0, 16)}...\` was submitted by \`${rogueTs.creator.identity}@${rogueTs.creator.msp}\`, an identity not in the asset-transfer endorsement policy.\n\n2. **Velocity Outlier** — INVOICE-8391 changed ownership 3 times in 248 seconds. Expected rate: 1 change/day.\n\n3. **Endorsement Mismatch** — The anomalous transaction was endorsed by Org3MSP only. Policy requires Org1MSP+Org2MSP.`;
  }
  if (q.includes('who') || q.includes('initiat') || q.includes('creator') || q.includes('identity')) {
    return `The anomalous transaction was initiated by **\`${rogueTs.creator.identity}\`** from **${rogueTs.creator.organization}** (MSP: \`${rogueTs.creator.msp}\`).\n\nThis identity is not a party to the original trade agreement between Org1 (Supplier) and Org2 (Bank). Their presence in this transaction chain is a workflow deviation requiring investigation.`;
  }
  if (q.includes('asset') || q.includes('invoice') || q.includes('happen')) {
    return `**INVOICE-8391** ($450,000 trade finance invoice) followed this path:\n\n→ Block 5: Created by \`supplier-admin\` (Org1MSP)\n→ Block 6: Transferred to \`bank-officer\` (Org2MSP) — normal\n→ Block 7: Transferred internally within Org2MSP — unexpected\n→ **Block 8: Transferred to \`unknown-entity-7742\` (ExternalMSP) by \`rogue-agent\` (Org3MSP) — ANOMALOUS**\n\nThe final ownership is now \`unknown-entity-7742@ExternalMSP\`, outside the original trade parties.`;
  }
  if (q.includes('organization') || q.includes('org') || q.includes('involved')) {
    return `Three organizations are involved in this investigation:\n\n• **Org1MSP** (Supplier) — Created the invoice legitimately. Blocks 5-6.\n• **Org2MSP** (Bank) — Received invoice for payment processing. Blocks 6-7. Also the source of the unexpected internal transfer.\n• **Org3MSP** — Rogue agent. Submitted the anomalous transfer at Block 8 without being in the endorsement policy.`;
  }
  if (q.includes('evidence') || q.includes('support') || q.includes('proof')) {
    return `The findings are supported by the following Fabric evidence:\n\n• **TX \`a7f3c2d1...\`** (Block 8) — The anomalous transfer transaction. Endorser: Org3MSP only (policy violation).\n• **TX \`d4e6f8a0...\`** (Block 7) — The unexpected internal Org2 transfer that preceded the rogue action.\n• **TX \`c3d5e7f9...\`** (Block 6) — The legitimate Supplier→Bank transfer, establishing the expected ownership chain.\n\nAll transaction IDs, block numbers, timestamps, and creator identities are from real Fabric ledger records.`;
  }
  if (q.includes('before') || q.includes('prior') || q.includes('previous')) {
    return `Immediately before the anomalous transaction (Block 8), at **09:22:44 UTC** (Block 7):\n\n\`bank-officer@Org2MSP\` transferred INVOICE-8391 to \`distributor-clerk@Org2MSP\`. This internal Org2 transfer was itself unexpected — the normal workflow would have had Org2 approve the invoice and mark it DELIVERED.\n\nThis internal transfer may have been a precursor to enable the subsequent rogue transfer.`;
  }
  if (q.includes('after') || q.includes('next') || q.includes('subsequent')) {
    return `After the anomalous transaction (Block 8 at 09:24:09 UTC):\n\nNo further transactions on INVOICE-8391 have been recorded. The asset is currently owned by \`unknown-entity-7742@ExternalMSP\` — an identity outside the known network participants.\n\n**Recommended immediate action:** Issue a channel-level asset freeze for INVOICE-8391 and revoke Org3MSP credentials pending investigation.`;
  }
  if (q.includes('endorse') || q.includes('policy')) {
    return `**Endorsement Policy Violation:**\n\nThe asset-transfer chaincode on tradechannel requires endorsement from **Org1MSP AND Org2MSP** for TransferAsset operations.\n\nTransaction \`a7f3c2d1...\` was endorsed **only by Org3MSP**. This means:\n1. Either the endorsement policy was recently modified without authorization, OR\n2. The ordering service accepted a transaction that violated the policy (a serious configuration issue)\n\nThis requires immediate audit of channel configuration update transactions.`;
  }
  return `Based on the evidence for Investigation ${investigation.id}:\n\n${investigation.summary}\n\nPlease ask a more specific question about the transaction, identity, asset, anomaly, or evidence.`;
}

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  const investigation = DEMO_INVESTIGATION;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (apiKey) {
    try {
      const evidenceSummary = JSON.stringify({
        investigationId: investigation.id,
        riskLevel: investigation.riskLevel,
        anomalies: investigation.anomalies.map(a => ({ id: a.id, severity: a.severity, title: a.title, description: a.description })),
        transactions: investigation.transactions.map(t => ({
          txId: t.transactionId.slice(0, 16) + '...',
          block: t.blockNumber,
          timestamp: t.timestamp,
          function: t.function,
          creator: t.creator,
          endorsers: t.endorsers,
          asset: t.asset,
        })),
        summary: investigation.summary,
      }, null, 2);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://sherloque.vercel.app',
          'X-Title': 'Sherloque Investigation Agent',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\n\nEVIDENCE:\n' + evidenceSummary },
            { role: 'user', content: question },
          ],
          max_tokens: 400,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;
        if (answer) {
          return NextResponse.json({ answer, source: 'ai', model: 'llama-3.1-8b' });
        }
      }
    } catch {
      // Fall through to deterministic
    }
  }

  const answer = deterministicAnswer(question, investigation);
  return NextResponse.json({ answer, source: 'deterministic', model: 'built-in' });
}
