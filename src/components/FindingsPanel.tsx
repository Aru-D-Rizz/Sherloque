'use client';
import { InvestigationScenario, AnomalyFinding, NFEOTransaction } from '@/lib/demo-data';

interface Props {
  investigation: InvestigationScenario;
  onSelectTx: (tx: NFEOTransaction) => void;
}

const severityConfig = {
  CRITICAL: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/40', dot: 'bg-danger' },
  HIGH: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/40', dot: 'bg-warning' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/40', dot: 'bg-yellow-400' },
  LOW: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/40', dot: 'bg-success' },
  INFO: { color: 'text-muted', bg: 'bg-muted/10', border: 'border-muted/40', dot: 'bg-muted' },
};

export default function FindingsPanel({ investigation, onSelectTx }: Props) {
  const txById = Object.fromEntries(investigation.transactions.map(t => [t.transactionId, t]));

  return (
    <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-mono text-muted tracking-widest">INVESTIGATION FINDINGS</h2>
        <div className="flex gap-2">
          {(['CRITICAL', 'HIGH', 'MEDIUM'] as const).map(s => (
            <span key={s} className={`px-2 py-0.5 rounded border text-xs font-mono ${severityConfig[s].color} ${severityConfig[s].border} ${severityConfig[s].bg}`}>
              {s}: {investigation.anomalies.filter((a: AnomalyFinding) => a.severity === s).length}
            </span>
          ))}
        </div>
      </div>

      {/* Workflow comparison */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-success/5 border border-success/20">
          <p className="text-xs font-mono text-success mb-3 tracking-widest">EXPECTED WORKFLOW</p>
          {investigation.expectedWorkflow.map((step, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-success/60 font-mono text-xs mt-0.5">{i + 1}.</span>
              <p className="text-xs text-white/80">{step}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-lg bg-danger/5 border border-danger/20">
          <p className="text-xs font-mono text-danger mb-3 tracking-widest">OBSERVED WORKFLOW</p>
          {investigation.observedWorkflow.map((step, i) => {
            const isAnomaly = step.includes('ANOMALOUS');
            const isUnexpected = step.includes('UNEXPECTED');
            return (
              <div key={i} className="flex gap-2 mb-2">
                <span className={`font-mono text-xs mt-0.5 ${isAnomaly ? 'text-danger' : isUnexpected ? 'text-warning' : 'text-success/60'}`}>{i + 1}.</span>
                <p className={`text-xs ${isAnomaly ? 'text-danger font-bold' : isUnexpected ? 'text-warning' : 'text-white/80'}`}>{step}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-4">
        {investigation.anomalies.map(anomaly => {
          const cfg = severityConfig[anomaly.severity];
          return (
            <div key={anomaly.id} className={`p-5 rounded-lg border ${cfg.border} ${cfg.bg}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-mono font-bold ${cfg.color}`}>{anomaly.severity}</span>
                  <span className="text-xs font-mono text-muted">· {anomaly.type}</span>
                </div>
                <span className="text-xs font-mono text-muted">{anomaly.id}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{anomaly.title}</h3>
              <p className="text-xs text-muted/90 leading-relaxed mb-4">{anomaly.description}</p>
              <div className="mb-4">
                <p className="text-xs font-mono text-muted mb-2">EVIDENCE TRANSACTIONS</p>
                <div className="flex flex-wrap gap-2">
                  {anomaly.evidenceTransactionIds.map(txId => {
                    const tx = txById[txId];
                    return (
                      <button
                        key={txId}
                        onClick={() => tx && onSelectTx(tx)}
                        className="px-2 py-1 rounded border border-border bg-panel text-xs font-mono text-brand hover:border-brand/50 transition-colors"
                      >
                        {txId.slice(0, 12)}... (Block {tx?.blockNumber})
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-3 rounded bg-panel border border-border">
                <p className="text-xs font-mono text-muted mb-1">RECOMMENDATION</p>
                <p className="text-xs text-white/80">{anomaly.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
