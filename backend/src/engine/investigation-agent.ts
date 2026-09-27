import { InvestigationScenario, InvestigationReport } from '../../../packages/shared/src/types';
import { TransactionAgent } from './transaction-agent';
import { IdentityAgent } from './identity-agent';
import { AssetAgent } from './asset-agent';
import { AnomalyAgent } from './anomaly-agent';
import { EvidenceAgent } from './evidence-agent';
import { EvidenceNormalizer } from '../services/evidence-normalizer';
import { AIProvider } from './ai-provider';

export class InvestigationAgent {
  public static async runInvestigation(targetId: string): Promise<{ scenario: InvestigationScenario; report: InvestigationReport }> {
    const scenario = EvidenceNormalizer.getNormalizedInvestigation(targetId);

    const txAnalysis = TransactionAgent.analyzeTransactions(scenario.transactions);
    const identityAnalysis = IdentityAgent.analyzeIdentities(scenario.transactions);
    const assetAnalysis = AssetAgent.analyzeAssetHistory(scenario.transactions);
    const detectedAnomalies = AnomalyAgent.detectAnomalies(scenario.transactions);
    const evidenceProofs = EvidenceAgent.correlateEvidence(detectedAnomalies.length > 0 ? detectedAnomalies : scenario.anomalies, scenario.transactions);

    void txAnalysis;
    void identityAnalysis;
    void assetAnalysis;
    void evidenceProofs;

    const reportMarkdown = this.generateReportMarkdown(scenario);

    const report: InvestigationReport = {
      investigationId: scenario.id,
      targetAssetId: scenario.targetAssetId,
      riskLevel: scenario.riskLevel,
      generatedAt: new Date().toISOString(),
      summary: scenario.summary,
      anomalies: scenario.anomalies,
      timeline: scenario.transactions.map((t, idx) => ({
        step: idx + 1,
        function: t.function,
        timestamp: t.timestamp,
        identity: `${t.creator.identity}@${t.creator.msp}`,
        anomaly: scenario.anomalies.some(a => a.evidenceTransactionIds.includes(t.transactionId)),
      })),
      evidenceSummary: `Analyzed ${scenario.transactions.length} transactions across channel ${scenario.channel} on chaincode ${scenario.chaincode}. ${scenario.anomalies.length} risk indicators detected.`,
      markdownContent: reportMarkdown,
    };

    return { scenario, report };
  }

  public static async askQuestion(question: string, targetId: string) {
    const scenario = EvidenceNormalizer.getNormalizedInvestigation(targetId);
    return await AIProvider.analyze({ prompt: question, context: scenario as unknown as Record<string, unknown> });
  }

  private static generateReportMarkdown(scenario: InvestigationScenario): string {
    return `# FORENSIC INVESTIGATION REPORT — ${scenario.id}

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
  }
}
