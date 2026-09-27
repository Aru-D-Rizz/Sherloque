'use client';
import { useState } from 'react';
import InvestigationView from '@/components/InvestigationView';
import { DEMO_INVESTIGATION } from '@/lib/demo-data';

export default function Home() {
  const [investigating, setInvestigating] = useState(false);
  const [input, setInput] = useState('');

  function startDemo() {
    setInvestigating(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInvestigating(true);
  }

  if (investigating) {
    return <InvestigationView investigation={DEMO_INVESTIGATION} onBack={() => setInvestigating(false)} />;
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand/20 flex items-center justify-center">
            <span className="text-brand font-mono text-xs font-bold">SQ</span>
          </div>
          <span className="font-mono text-sm font-bold text-white tracking-widest">SHERLOQUE</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted font-mono">FABRIC INVESTIGATION AGENT</span>
          <span className="px-2 py-1 rounded bg-brand/10 border border-brand/30 text-brand text-xs font-mono">DEMO MODE</span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 bg-brand/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-brand text-xs font-mono">HYPERLEDGER FABRIC · IBM BOB 2.0</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Investigate.<br />
            <span className="text-brand">Trace.</span> Uncover.
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            Autonomous forensic intelligence for Hyperledger Fabric.<br />
            Every finding backed by real blockchain evidence.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mb-8">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Transaction ID / Asset ID / Identity..."
              className="flex-1 bg-panel border border-border rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-muted focus:outline-none focus:border-brand transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand text-surface rounded-lg text-sm font-bold font-mono hover:bg-brand/90 transition-colors"
            >
              INVESTIGATE
            </button>
          </div>
        </form>

        {/* Quick starts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mb-12">
          <button
            onClick={startDemo}
            className="group p-4 bg-panel border border-danger/30 rounded-lg text-left hover:border-danger/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-xs font-mono text-danger">CRITICAL ANOMALY</span>
            </div>
            <p className="text-sm font-mono text-white font-bold">INV-8391</p>
            <p className="text-xs text-muted mt-1">Trade Finance Rogue Hijack · Org3 intrusion</p>
          </button>
          <button
            onClick={startDemo}
            className="group p-4 bg-panel border border-border rounded-lg text-left hover:border-brand/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span className="text-xs font-mono text-muted">SAMPLE</span>
            </div>
            <p className="text-sm font-mono text-white font-bold">INVOICE-8391</p>
            <p className="text-xs text-muted mt-1">Asset history · $450K invoice</p>
          </button>
        </div>

        {/* How it works */}
        <div className="w-full max-w-2xl">
          <p className="text-center text-xs font-mono text-muted mb-6 tracking-widest">HOW IT WORKS</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['Fabric Block', '→', 'Evidence Extraction', '→', 'Agent Analysis', '→', 'Anomaly Detection', '→', 'Investigation Report'].map((step, i) => (
              <span key={i} className={step === '→' ? 'text-muted' : 'px-3 py-1 rounded border border-border bg-panel text-xs font-mono text-white'}>
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted font-mono">
        Built with IBM Bob 2.0 · Hyperledger Fabric 2.5.7 · TypeScript · Next.js · React Flow
      </footer>
    </main>
  );
}
