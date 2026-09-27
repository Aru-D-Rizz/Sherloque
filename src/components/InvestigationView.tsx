'use client';
import { useState } from 'react';
import { InvestigationScenario, NFEOTransaction } from '@/lib/demo-data';
import EvidenceGraph from './EvidenceGraph';
import Timeline from './Timeline';
import FindingsPanel from './FindingsPanel';
import AskSherloque from './AskSherloque';
import ReportModal from './ReportModal';

interface Props {
  investigation: InvestigationScenario;
  onBack: () => void;
}

type Tab = 'graph' | 'timeline' | 'findings' | 'ask';

export default function InvestigationView({ investigation, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('graph');
  const [selectedTx, setSelectedTx] = useState<NFEOTransaction | null>(null);
  const [showReport, setShowReport] = useState(false);

  const riskColor = {
    CRITICAL: 'text-danger border-danger/40 bg-danger/10',
    HIGH: 'text-warning border-warning/40 bg-warning/10',
    MEDIUM: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
    LOW: 'text-success border-success/40 bg-success/10',
  }[investigation.riskLevel];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'graph', label: 'Evidence Graph' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'findings', label: `Findings (${investigation.anomalies.length})` },
    { id: 'ask', label: 'Ask Sherloque' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-muted hover:text-white text-sm font-mono transition-colors">
              ← BACK
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs text-muted">INVESTIGATION</span>
                <span className="font-mono text-sm font-bold text-white">#{investigation.id}</span>
                <span className={`px-2 py-0.5 rounded border text-xs font-mono font-bold ${riskColor}`}>
                  {investigation.riskLevel} RISK
                </span>
              </div>
              <p className="text-sm text-muted">{investigation.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs font-mono">
              <div>
                <p className="text-muted mb-0.5">TARGET</p>
                <p className="text-white font-bold">{investigation.targetAssetId}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">CHANNEL</p>
                <p className="text-white">{investigation.channel}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">CHAINCODE</p>
                <p className="text-white">{investigation.chaincode}</p>
              </div>
              <div>
                <p className="text-muted mb-0.5">ANOMALIES</p>
                <p className="text-danger font-bold">{investigation.anomalies.length}</p>
              </div>
            </div>

            <button
              onClick={() => setShowReport(true)}
              className="px-3 py-1.5 rounded bg-brand/10 border border-brand/40 text-brand text-xs font-mono font-bold hover:bg-brand/20 transition-colors"
            >
              📄 EXPORT REPORT
            </button>
          </div>
        </div>

        {/* Demo banner */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono text-brand/70">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            DEMO MODE — Using captured Hyperledger Fabric evidence
          </div>
          <span className="text-muted">Source of Truth: Hyperledger Fabric 2.5.7</span>
        </div>
      </div>

      {/* Summary bar */}
      <div className="bg-panel border-b border-border px-6 py-3">
        <p className="text-xs text-muted leading-relaxed">{investigation.summary}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-6">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-mono border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'graph' && (
          <EvidenceGraph investigation={investigation} onSelectTx={setSelectedTx} />
        )}
        {activeTab === 'timeline' && (
          <Timeline investigation={investigation} onSelectTx={setSelectedTx} />
        )}
        {activeTab === 'findings' && (
          <FindingsPanel investigation={investigation} onSelectTx={setSelectedTx} />
        )}
        {activeTab === 'ask' && (
          <AskSherloque investigation={investigation} />
        )}
      </div>

      {/* Transaction detail drawer */}
      {selectedTx && (
        <div className="fixed inset-y-0 right-0 w-96 bg-panel border-l border-border overflow-y-auto z-50 shadow-2xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-muted">TRANSACTION DETAIL</span>
              <button onClick={() => setSelectedTx(null)} className="text-muted hover:text-white text-sm font-mono">✕</button>
            </div>
            <TxDetail tx={selectedTx} anomalyTxIds={investigation.anomalies.flatMap(a => a.evidenceTransactionIds)} />
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <ReportModal investigationId={investigation.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

function TxDetail({ tx, anomalyTxIds }: { tx: NFEOTransaction; anomalyTxIds: string[] }) {
  const isAnomaly = anomalyTxIds.includes(tx.transactionId);
  return (
    <div className="space-y-4 text-xs font-mono">
      <div className={`p-3 rounded border ${isAnomaly ? 'border-danger/40 bg-danger/5' : 'border-success/30 bg-success/5'}`}>
        <span className={isAnomaly ? 'text-danger font-bold' : 'text-success font-bold'}>
          {isAnomaly ? '⚠ ANOMALOUS TRANSACTION' : '✓ NORMAL TRANSACTION'}
        </span>
      </div>
      {[
        ['TX ID', tx.transactionId.slice(0, 20) + '...'],
        ['Block', String(tx.blockNumber)],
        ['Timestamp', new Date(tx.timestamp).toLocaleString()],
        ['Function', tx.function],
        ['Channel', tx.channel],
        ['Chaincode', tx.chaincode],
      ].map(([k, v]) => (
        <div key={k}>
          <p className="text-muted mb-0.5">{k}</p>
          <p className="text-white">{v}</p>
        </div>
      ))}
      <div>
        <p className="text-muted mb-1">CREATOR IDENTITY</p>
        <p className="text-white">{tx.creator.identity}</p>
        <p className="text-muted">{tx.creator.organization} · {tx.creator.msp}</p>
      </div>
      <div>
        <p className="text-muted mb-1">ENDORSING PEERS</p>
        {tx.endorsers.map(e => (
          <span key={e} className="inline-block mr-2 mb-1 px-2 py-0.5 rounded bg-panel border border-border text-white">{e}</span>
        ))}
      </div>
      {tx.asset && (
        <div>
          <p className="text-muted mb-1">ASSET TRANSFER DETAIL</p>
          <p className="text-white">{tx.asset.id}</p>
          <p className="text-muted">{tx.asset.previousOwner || '(new)'} → {tx.asset.newOwner}</p>
          <p className="text-muted">{tx.asset.previousOrganization || '(none)'} → {tx.asset.newOrganization}</p>
        </div>
      )}
    </div>
  );
}
