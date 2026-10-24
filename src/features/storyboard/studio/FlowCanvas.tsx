import { useMemo } from "react";
import { ReactFlow, Background, Controls, Handle, Position, BackgroundVariant, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Film, Image, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Board, ShotNode } from "@/lib/board-store";

type ShotFlowNode = Node<{ shot: ShotNode; index: number }, "shot">;
function ShotCard({ data, selected }: NodeProps<ShotFlowNode>) {
  const { shot, index } = data;
  const Icon = shot.kind === "reference" ? UserRound : shot.kind === "video" ? Film : Image;
  return <article className={`production-node rounded-lg border bg-card text-card-foreground ${selected ? "border-primary ring-2 ring-ring/30" : "border-border"}`}>
    <Handle type="target" position={Position.Left} aria-label={`Input ${shot.title}`} />
    <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs font-medium"><span className="flex items-center gap-2"><Icon className="size-4 text-primary" /> {String(index + 1).padStart(2,"0")} · {shot.kind === "reference" ? "Reference" : shot.kind === "video" ? "Motion" : "Scene"}</span><span className="text-muted-foreground">{shot.duration}s</span></header>
    <div className="nodrag aspect-video overflow-hidden bg-muted">{shot.videoUrl || shot.motionPreviewUrl ? <video src={shot.videoUrl || shot.motionPreviewUrl || undefined} controls className="size-full object-cover" /> : shot.imageUrl ? <img src={shot.imageUrl} alt={shot.title} draggable={false} className="size-full object-cover" /> : <div className="grid size-full place-items-center"><Icon className="size-8 text-muted-foreground" /></div>}</div>
    <div className="space-y-1 p-3"><h3 className="truncate text-sm font-semibold">{shot.title}</h3><p className="line-clamp-2 text-xs text-muted-foreground">{shot.action || shot.prompt || shot.videoPrompt || ""}</p>{shot.frame && <p className="truncate text-xs text-muted-foreground">{shot.frame}</p>}</div>
    {!!shot.previsFrames?.length && <div className="grid grid-cols-3 gap-1 border-t border-border p-2">{shot.previsFrames.map((url,i) => <img key={i} src={url} alt={`${shot.title} previs ${i+1}`} className="aspect-video w-full object-cover" />)}</div>}
    <Handle type="source" position={Position.Right} aria-label={`Output ${shot.title}`} />
  </article>;
}
const nodeTypes = { shot: ShotCard };
export function FlowCanvas({ board, selectedId, onSelect, onMove, onConnect, onDisconnect, onDelete, onAdd, onAddVideo }: {
  board: Board; selectedId: string | null; onSelect: (id: string | null) => void; onMove: (id: string, x: number, y: number) => void;
  onConnect: (from: string, to: string) => void; onDisconnect: (edgeId: string) => void; onDelete: (id:string) => void; onAdd: () => void; onAddVideo: () => void;
}) {
  const nodes = useMemo<ShotFlowNode[]>(() => board.shots.map((shot,index) => ({ id: shot.id, type: "shot", position: { x: shot.x, y: shot.y }, selected: shot.id === selectedId, data: { shot, index } })),[board.shots,selectedId]);
  const edges = useMemo(() => board.edges.map(edge => ({ id: edge.id, source: edge.from, target: edge.to, type: "default", selected: false })),[board.edges]);
  return <section aria-label="Production node canvas" className="production-flow relative min-h-0 flex-1 bg-background">
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.15, maxZoom: 1, minZoom: 0.55 }} minZoom={0.15} maxZoom={2} onPaneClick={() => onSelect(null)} onNodeClick={(_,node) => onSelect(node.id)} onNodeDragStop={(_,node) => onMove(node.id,node.position.x,node.position.y)} onConnect={connection => { if(connection.source && connection.target) onConnect(connection.source,connection.target); }} onEdgesDelete={deleted => deleted.forEach(edge => onDisconnect(edge.id))} onEdgeDoubleClick={(_,edge) => onDisconnect(edge.id)} onNodesDelete={deleted => deleted.forEach(node => onDelete(node.id))} onNodesChange={changes => changes.forEach(change => { if(change.type === "position" && change.position) onMove(change.id,change.position.x,change.position.y); })} deleteKeyCode={["Backspace","Delete"]} proOptions={{ hideAttribution: true }}>
      <Background id="grid-fine" variant={BackgroundVariant.Lines} gap={24} lineWidth={0.5} color="var(--border)" /><Background id="grid-major" variant={BackgroundVariant.Lines} gap={120} lineWidth={1} color="color-mix(in oklab, var(--primary) 35%, transparent)" />
      <Controls showInteractive={false} />
    </ReactFlow>
    <div className="absolute right-3 top-3 flex gap-2"><Button size="sm" variant="secondary" onClick={onAdd}><Plus /> Scene</Button><Button size="sm" variant="secondary" onClick={onAddVideo}><Film /> Motion</Button></div>
  </section>;
}
