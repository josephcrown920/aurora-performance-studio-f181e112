import { useMemo } from "react";
import { ReactFlow, Background, Controls, Handle, Position, BackgroundVariant, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Plus, Film, Image, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Board, ShotNode } from "@/lib/board-store";

type ShotFlowNode = Node<{ shot: ShotNode; index: number }, "shot">;
function ShotCard({ data, selected }: NodeProps<ShotFlowNode>) {
  const { shot, index } = data;
  return <article className={`production-node rounded-lg border bg-card text-card-foreground ${selected ? "border-primary ring-2 ring-ring/30" : "border-border"}`}>
    <Handle type="target" position={Position.Left} aria-label={`Input ${shot.title}`} />
    <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs font-semibold"><span className="flex items-center gap-2">{shot.kind === "video" ? <Film className="size-4 text-primary" /> : <Image className="size-4 text-primary" />} {String(index + 1).padStart(2,"0")} · {shot.kind === "video" ? "Motion" : "Scene"}</span><span className="text-muted-foreground">{shot.duration}s</span></header>
    <div className="aspect-video overflow-hidden bg-muted">{shot.imageUrl ? <img src={shot.imageUrl} alt={shot.title} draggable={false} className="size-full object-cover" /> : <div className="grid size-full place-items-center"><Image className="size-8 text-muted-foreground" /></div>}</div>
    <div className="space-y-1 p-3"><h3 className="truncate text-sm font-bold">{shot.title}</h3><p className="line-clamp-2 text-xs text-muted-foreground">{shot.prompt || shot.videoPrompt || shot.scene}</p></div>
    <Handle type="source" position={Position.Right} aria-label={`Output ${shot.title}`} />
  </article>;
}
const nodeTypes = { shot: ShotCard };
export function FlowCanvas({ board, selectedId, onSelect, onMove, onConnect, onDisconnect, onAdd, onAddVideo }: {
  board: Board; selectedId: string | null; onSelect: (id: string) => void; onMove: (id: string, x: number, y: number) => void;
  onConnect: (from: string, to: string) => void; onDisconnect: (edgeId: string) => void; onAdd: () => void; onAddVideo: () => void;
}) {
  const nodes = useMemo<ShotFlowNode[]>(() => board.shots.map((shot,index) => ({ id: shot.id, type: "shot", position: { x: shot.x, y: shot.y }, selected: shot.id === selectedId, data: { shot, index } })),[board.shots,selectedId]);
  const edges = useMemo(() => board.edges.map(edge => ({ id: edge.id, source: edge.from, target: edge.to, type: "smoothstep" })),[board.edges]);
  return <section aria-label="Production node canvas" className="production-flow relative min-h-0 flex-1 bg-background">
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.18 }} minZoom={0.15} maxZoom={2} onNodeClick={(_,node) => onSelect(node.id)} onNodeDragStop={(_,node) => onMove(node.id,node.position.x,node.position.y)} onConnect={connection => { if(connection.source && connection.target) onConnect(connection.source,connection.target); }} onEdgesDelete={deleted => deleted.forEach(edge => onDisconnect(edge.id))} onEdgeDoubleClick={(_,edge) => onDisconnect(edge.id)} onNodesChange={changes => changes.forEach(change => { if(change.type === "position" && change.position) onMove(change.id,change.position.x,change.position.y); })} deleteKeyCode={["Backspace","Delete"]} proOptions={{ hideAttribution: true }}>
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--border)" />
      <Controls showInteractive={false} />
    </ReactFlow>
    <div className="absolute right-3 top-3 flex gap-2"><Button size="sm" variant="secondary" onClick={onAdd}><Plus /> Scene</Button><Button size="sm" variant="secondary" onClick={onAddVideo}><Film /> Motion</Button></div>
  </section>;
}
