'use client';
import { useState } from 'react';

interface Props {
  investigationId: string;
  onClose: () => void;
}

export default function ReportModal({ investigationId, onClose }: Props) {
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateReport() {
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investigationId }),
      });
      const data = await res.json();
      setReportMarkdown(data.markdown || 'Report generation failed.');
    } catch {
      setReportMarkdown('Error generating report.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-panel border border-border rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-1 rounded bg-brand/20 text-brand font-bold">REPORT</span>
            <h3 className="text-sm font-mono text-white font-bold">Forensic Investigation Report — #{investigationId}</h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white font-mono text-sm">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-white/90">
          {!reportMarkdown ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted">Generate a formal evidence-backed investigation report for target #{investigationId}.</p>
              <button
                onClick={generateReport}
                disabled={loading}
                className="px-6 py-3 bg-brand text-surface font-bold rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'GENERATING REPORT...' : 'GENERATE INVESTIGATION REPORT'}
              </button>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap bg-surface p-4 rounded border border-border text-white/90 font-mono text-xs">
              {reportMarkdown}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        {reportMarkdown && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-xs font-mono text-muted">Format: Markdown / Fabric Proof Log</span>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-brand/10 border border-brand/40 text-brand text-xs font-mono font-bold rounded hover:bg-brand/20 transition-colors"
              >
                {copied ? 'COPIED TO CLIPBOARD ✓' : 'COPY MARKDOWN'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-border text-white text-xs font-mono rounded hover:bg-border/80 transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
