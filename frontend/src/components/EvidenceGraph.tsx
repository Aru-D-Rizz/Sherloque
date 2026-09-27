'use client';
import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { InvestigationScenario, NFEOTransaction } from '@/lib/demo-data';

interface Props {
  investigation: InvestigationScenario;
  onSelectTx: (tx: NFEOTransaction) => void;
}

const nodeStyle = (type: string, anomaly: boolean) => ({
  background: anomaly ? '#2d0a0a' : '#161b22',
  border: `1px solid ${anomaly ? '#ff4757' : type === 'identity' ? '#00d4ff' : type === 'asset' ? '#ffa502' : '#2ed573'}`,
  color: '#e6edf3',
  borderRadius: '8px',
  padding: '10px 16px',
  fontSize: '11px',
  fontFamily: 'monospace',
  minWidth: '140px',
  textAlign: 'center' as const,
});

export default function EvidenceGraph({ investigation, onSelectTx }: Props) {
  const anomalyTxIds = new Set(investigation.anomalies.flatMap(a => a.evidenceTransactionIds));
  void anomalyTxIds;

  const initialNodes: Node[] = [
    // Identities
    { id: 'id-supplier', type: 'default', position: { x: 80, y: 60 }, data: { label: '👤 supplier-admin\nOrg1MSP' }, style: nodeStyle('identity', false) },
    { id: 'id-bank', type: 'default', position: { x: 80, y: 220 }, data: { label: '👤 bank-officer\nOrg2MSP' }, style: nodeStyle('identity', false) },
    { id: 'id-clerk', type: 'default', position: { x: 80, y: 380 }, data: { label: '👤 distributor-clerk\nOrg2MSP' }, style: nodeStyle('identity', false) },
    { id: 'id-rogue', type: 'default', position: { x: 80, y: 540 }, data: { label: '⚠ rogue-agent\nOrg3MSP' }, style: nodeStyle('identity', true) },
    // Transactions
    { id: 'tx-1', type: 'default', position: { x: 340, y: 60 }, data: { label: '🔗 Block 5\nCreateAsset' }, style: nodeStyle('tx', false) },
    { id: 'tx-2', type: 'default', position: { x: 340, y: 220 }, data: { label: '🔗 Block 6\nTransferAsset' }, style: nodeStyle('tx', false) },
    { id: 'tx-3', type: 'default', position: { x: 340, y: 380 }, data: { label: '🔗 Block 7\nTransferAsset' }, style: nodeStyle('tx', false) },
    { id: 'tx-4', type: 'default', position: { x: 340, y: 540 }, data: { label: '⚠ Block 8\nTransferAsset' }, style: nodeStyle('tx', true) },
    // Asset states
    { id: 'asset-1', type: 'default', position: { x: 600, y: 60 }, data: { label: '📄 INVOICE-8391\nOwner: Org1MSP' }, style: nodeStyle('asset', false) },
    { id: 'asset-2', type: 'default', position: { x: 600, y: 220 }, data: { label: '📄 INVOICE-8391\nOwner: Org2MSP' }, style: nodeStyle('asset', false) },
    { id: 'asset-3', type: 'default', position: { x: 600, y: 380 }, data: { label: '📄 INVOICE-8391\nOwner: Org2MSP (internal)' }, style: nodeStyle('asset', false) },
    { id: 'asset-4', type: 'default', position: { x: 600, y: 540 }, data: { label: '⚠ INVOICE-8391\nOwner: ExternalMSP' }, style: nodeStyle('asset', true) },
    // Unknown entity
    { id: 'id-unknown', type: 'default', position: { x: 860, y: 540 }, data: { label: '⚠ unknown-entity-7742\nExternalMSP' }, style: nodeStyle('identity', true) },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1', source: 'id-supplier', target: 'tx-1', label: 'submits', style: { stroke: '#8b949e' }, labelStyle: { fill: '#8b949e', fontSize: 10 } },
    { id: 'e2', source: 'tx-1', target: 'asset-1', label: 'creates', style: { stroke: '#8b949e' }, labelStyle: { fill: '#8b949e', fontSize: 10 } },
    { id: 'e3', source: 'id-supplier', target: 'tx-2', label: 'transfers', style: { stroke: '#8b949e' }, labelStyle: { fill: '#8b949e', fontSize: 10 } },
    { id: 'e4', source: 'tx-2', target: 'asset-2', label: '→ Org2', style: { stroke: '#2ed573' }, labelStyle: { fill: '#2ed573', fontSize: 10 } },
    { id: 'e5', source: 'id-bank', target: 'tx-3', label: 'transfers', style: { stroke: '#ffa502' }, labelStyle: { fill: '#ffa502', fontSize: 10 } },
    { id: 'e6', source: 'tx-3', target: 'asset-3', label: '→ internal', style: { stroke: '#ffa502' }, labelStyle: { fill: '#ffa502', fontSize: 10 } },
    { id: 'e7', source: 'id-rogue', target: 'tx-4', label: '⚠ submits', style: { stroke: '#ff4757', strokeWidth: 2 }, labelStyle: { fill: '#ff4757', fontSize: 10 } },
    { id: 'e8', source: 'tx-4', target: 'asset-4', label: '⚠ hijack', style: { stroke: '#ff4757', strokeWidth: 2 }, labelStyle: { fill: '#ff4757', fontSize: 10 } },
    { id: 'e9', source: 'asset-4', target: 'id-unknown', label: '→ external', style: { stroke: '#ff4757', strokeWidth: 2, strokeDasharray: '5,5' }, labelStyle: { fill: '#ff4757', fontSize: 10 } },
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const txMap: Record<string, number> = { 'tx-1': 0, 'tx-2': 1, 'tx-3': 2, 'tx-4': 3 };
    const idx = txMap[node.id];
    if (idx !== undefined) {
      onSelectTx(investigation.transactions[idx]);
    }
  }, [investigation, onSelectTx]);

  return (
    <div className="relative" style={{ height: 'calc(100vh - 220px)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#21262d" />
        <Controls className="bg-panel border border-border" />
        <MiniMap nodeColor={() => '#161b22'} maskColor="rgba(13,17,23,0.8)" className="bg-panel border border-border" />
      </ReactFlow>
      <div className="absolute bottom-6 left-6 flex gap-4 text-xs font-mono pointer-events-none">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#00d4ff] inline-block" /> Normal</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#ffa502] inline-block" /> Unexpected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#ff4757] inline-block" /> Anomalous</span>
      </div>
    </div>
  );
}
