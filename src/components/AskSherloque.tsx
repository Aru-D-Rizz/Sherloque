'use client';
import { useState, useRef, useEffect } from 'react';
import { InvestigationScenario } from '@/lib/demo-data';

interface Props {
  investigation: InvestigationScenario;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
}

const SUGGESTED = [
  'Why was this transaction flagged?',
  'Who initiated the anomalous transfer?',
  'What happened to the asset?',
  'Which organizations were involved?',
  'What evidence supports the findings?',
  'What happened immediately before the anomaly?',
];

export default function AskSherloque({ investigation }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Investigation **${investigation.id}** loaded. I have analyzed ${investigation.transactions.length} transactions and identified ${investigation.anomalies.length} anomalies. Risk level: **${investigation.riskLevel}**.\n\nAsk me anything about the evidence.`,
      source: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function ask(question: string) {
    if (!question.trim()) return;
    setMessages(m => [...m, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.answer, source: data.source }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Unable to process question. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function formatContent(content: string) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="bg-panel border border-border px-1 rounded text-brand text-xs">$1</code>')
      .replace(/\n/g, '<br />');
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-brand/10 border border-brand/30 text-white'
                : 'bg-panel border border-border text-white/90'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded bg-brand/20 flex items-center justify-center">
                    <span className="text-brand text-xs font-bold font-mono">S</span>
                  </div>
                  <span className="text-xs font-mono text-muted">SHERLOQUE</span>
                  {msg.source && <span className="text-xs font-mono text-muted/60">· {msg.source}</span>}
                </div>
              )}
              <p
                className="text-xs leading-relaxed font-mono"
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-panel border border-border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-brand/20 flex items-center justify-center">
                  <span className="text-brand text-xs font-bold font-mono">S</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      <div className="px-6 py-3 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED.map(q => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={loading}
              className="px-3 py-1.5 rounded border border-border bg-panel text-xs font-mono text-muted hover:text-white hover:border-brand/50 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); ask(input); }} className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about the evidence..."
            disabled={loading}
            className="flex-1 bg-panel border border-border rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder-muted focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-brand text-surface rounded-lg text-xs font-bold font-mono hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            ASK
          </button>
        </form>
      </div>
    </div>
  );
}
