'use client';
import { InvestigationScenario, NFEOTransaction } from '@/lib/demo-data';

interface Props {
  investigation: InvestigationScenario;
  onSelectTx: (tx: NFEOTransaction) => void;
}

export default function Timeline({ investigation, onSelectTx }: Props) {
  const anomalyTxIds = new Set(investigation.anomalies.flatMap(a => a.evidenceTransactionIds));

  const events = investigation.transactions.map(tx => {
    const isAnomaly = anomalyTxIds.has(tx.transactionId);
    const time = new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return { tx, isAnomaly, time };
  });

  return (
    <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      <h2 className="text-xs font-mono text-muted mb-6 tracking-widest">ASSET TIMELINE — {investigation.targetAssetId}</h2>
      <div className="relative">
        <div className="absolute left-[88px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-0">
          {events.map(({ tx, isAnomaly, time }) => (
            <div key={tx.transactionId} className="flex gap-6 pb-8">
              {/* Time */}
              <div className="w-20 text-right pt-1">
                <span className="text-xs font-mono text-muted">{time}</span>
              </div>
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${isAnomaly ? 'bg-danger border-danger animate-pulse' : 'bg-panel border-brand'}`} />
              </div>
              {/* Content */}
              <button
                onClick={() => onSelectTx(tx)}
                className={`flex-1 p-4 rounded-lg border text-left transition-colors hover:border-brand/50 ${
                  isAnomaly
                    ? 'bg-danger/5 border-danger/30 hover:border-danger/60'
                    : 'bg-panel border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    {isAnomaly && (
                      <span className="inline-block px-2 py-0.5 rounded bg-danger/20 text-danger text-xs font-mono font-bold mb-1">
                        ⚠ ANOMALY DETECTED
                      </span>
                    )}
                    <p className="text-sm font-bold text-white font-mono">{tx.function}</p>
                    <p className="text-xs text-muted font-mono">Block {tx.blockNumber}</p>
                  </div>
                  <span className={`text-xs font-mono ${isAnomaly ? 'text-danger' : 'text-muted'}`}>
                    CLICK FOR EVIDENCE →
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-muted">Creator: </span>
                    <span className="text-white">{tx.creator.identity}</span>
                    <span className="text-muted"> · {tx.creator.msp}</span>
                  </div>
                  {tx.asset && (
                    <div>
                      <span className="text-muted">Transfer: </span>
                      <span className="text-white">{tx.asset.previousOwner || 'new'} → {tx.asset.newOwner}</span>
                    </div>
                  )}
                </div>
                {isAnomaly && (
                  <div className="mt-2 text-xs font-mono text-danger/80">
                    {investigation.anomalies
                      .filter(a => a.evidenceTransactionIds.includes(tx.transactionId))
                      .map(a => <p key={a.id}>⚠ {a.title}</p>)
                    }
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
