import { NextRequest, NextResponse } from 'next/server';
import { DEMO_INVESTIGATION } from '@/lib/demo-data';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  void body;
  const scenario = DEMO_INVESTIGATION;

  const markdown = `# FORENSIC INVESTIGATION REPORT — ${scenario.id}

**Target Asset:** \`${scenario.targetAssetId}\`  
**Channel:** \`${scenario.channel}\` | **Chaincode:** \`${scenario.chaincode}\`  
**Risk Level:** **${scenario.riskLevel}**  
**Generated At:** \`${new Date().toISOString()}\`  

---

## Executive Summary

${scenario.summary}

---

## Observed Workflow vs Expected Baseline

### Expected Workflow
${scenario.expectedWorkflow.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

### Observed Workflow
${scenario.observedWorkflow.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

---

## Anomalies & Risk Indicators (${scenario.anomalies.length})

${scenario.anomalies
  .map(
    a => `### [${a.severity}] ${a.id}: ${a.title}
**Type:** \`${a.type}\`  
**Description:** ${a.description}  
**Supporting Transaction Evidence:**  
${a.evidenceTransactionIds.map(txId => `- \`${txId}\``).join('\n')}  
**Recommendation:** ${a.recommendation}`
  )
  .join('\n\n')}

---

## Fabric Blockchain Evidence Audit Log

| Block | Function | Submitter | Endorsers | Target Asset State |
|---|---|---|---|---|
${scenario.transactions
  .map(
    t =>
      `| Block ${t.blockNumber} | \`${t.function}\` | \`${t.creator.identity}@${t.creator.msp}\` | \`${t.endorsers.join(', ')}\` | ${t.asset ? `\`${t.asset.previousOwner || 'new'}\` → \`${t.asset.newOwner}\`` : 'N/A'} |`
  )
  .join('\n')}

---

*Report generated automatically by Sherloque Fabric Investigation Agent.*
`;

  return NextResponse.json({ ok: true, markdown, investigationId: scenario.id });
}
