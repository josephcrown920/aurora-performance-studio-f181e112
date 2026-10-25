import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download, Layers3, MessageSquare, PanelRightClose, PanelRightOpen, X, UserRound, Shirt, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoard, chainOrder, uid, type Edge } from "@/lib/board-store";
import { exportBoardZip } from "@/lib/export-zip";
import { FlowCanvas } from "./FlowCanvas";
import { Inspector } from "./Inspector";
import { Timeline } from "./Timeline";
import { CharactersPanel } from "./CharactersPanel";
import { DirectorChat } from "./DirectorChat";
import { DirectorRoomRail, type DirectorRoomPanel } from "./DirectorRoomRail";
import { MoodboardPanel } from "./MoodboardPanel";
import { appendCanvasVideos } from "@/features/video-studio/canvas-timeline";
import { loadTimeline, saveTimeline } from "@/features/creative-studio/lib/timeline-state";

export function StudioPage({ canvasOnly = false }: { canvasOnly?: boolean }) {
  const { board, setBoard, updateShot, addShot, removeShot, connect, disconnect } = useBoard();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<DirectorRoomPanel>("storyboard");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.slice(1);
      if (["scenes","storyboard","wardrobe","moodboard","flows","layers"].includes(hash)) setPanel(hash as DirectorRoomPanel);
    };
    readHash(); window.addEventListener("hashchange",readHash);
    return () => window.removeEventListener("hashchange",readHash);
  }, []);
  function selectPanel(next: DirectorRoomPanel) { setPanel(next); setInspectorOpen(false); setChatOpen(false); window.history.replaceState(null,"",`#${next}`); }
  async function exportBoard() {
    if (!board) return;
    setExporting(true); setNotice(null);
    try { const result = await exportBoardZip(board); setNotice(result.missing.length ? `Export downloaded; ${result.missing.length} unavailable assets omitted.` : "Export downloaded."); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Export failed."); }
    finally { setExporting(false); }
  }
  function reorder(dragId: string, dropId: string) {
    setBoard(b => {
      const order = chainOrder(b).map(s => s.id);
      const from = order.indexOf(dragId), to = order.indexOf(dropId);
      if (from < 0 || to < 0) return b;
      order.splice(to,0,...order.splice(from,1));
      const edges: Edge[] = order.slice(0,-1).flatMap((id,i) => order[i+1] ? [{id:uid(),from:id,to:order[i+1]}] : []);
      return {...b,edges};
    });
  }
  if (!board) return <div className="p-8 text-muted-foreground">Loading your studio…</div>;
  const selected = board.shots.find(s => s.id === selectedId) ?? null;
  const graphVisible = canvasOnly || panel === "storyboard" || panel === "flows";
  return <main className="director-clean-shell bg-background text-foreground">
    <header className="director-clean-header border-b border-border">
      <div className="director-clean-title"><Link to="/" className="text-lg font-semibold">Aurora</Link><input aria-label="Board title" value={board.title} onChange={e => setBoard(b => ({...b,title:e.target.value}))} className="min-w-0 bg-transparent text-sm text-muted-foreground outline-none" /></div>
      <nav aria-label="Workspace actions" className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm"><Link to="/studio" search={{ mode: undefined }} onClick={() => saveTimeline(appendCanvasVideos(loadTimeline(), board))}>Video Studio</Link></Button>
        <Button asChild variant="outline" size="sm"><Link to="/perform-anywhere" search={{ experience: "grwm" }}><Shirt />Get Ready With Me</Link></Button>
        <Button asChild variant="outline" size="sm"><Link to="/admin"><Shield />Admin</Link></Button>
        <Button variant="outline" size="icon" title="Add character reference" aria-label="Add character reference" onClick={() => {setSelectedId(addShot({kind:"reference",title:"Character Lock"}));setInspectorOpen(true);}}><UserRound /></Button>
        <Button asChild variant="outline" size="sm"><Link to="/layers"><Layers3 /> Layers</Link></Button>
        <Button variant="outline" size="icon" title="Inspector" aria-label="Inspector" aria-pressed={inspectorOpen} onClick={() => { setInspectorOpen(v => !v); setChatOpen(false); }}>{inspectorOpen ? <PanelRightClose /> : <PanelRightOpen />}</Button>
        <Button variant="outline" size="icon" title="Director" aria-label="Director" aria-pressed={chatOpen} onClick={() => {setChatOpen(v => !v);setInspectorOpen(false);}}><MessageSquare /></Button>
        <Button variant="outline" size="icon" title="Export ZIP" aria-label="Export ZIP" disabled={exporting} onClick={() => void exportBoard()}><Download /></Button>
      </nav>
    </header>
    {notice && <p role="status" className="border-b border-border px-4 py-2 text-xs text-muted-foreground">{notice}</p>}
    <div className={canvasOnly ? "director-canvas-only" : "director-room-workspace"}>
      {!canvasOnly && <DirectorRoomRail activePanel={panel} onPanelChange={next => selectPanel(next)} />}
      <div className={`director-canvas-layout ${inspectorOpen || chatOpen ? "with-inspector" : ""}`}>
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {graphVisible ? <>
            <FlowCanvas board={board} selectedId={selectedId} onSelect={id => {setSelectedId(id);setInspectorOpen(!!id);setChatOpen(false);}} onMove={(id,x,y) => updateShot(id,{x,y})} onConnect={connect} onDisconnect={disconnect} onDelete={removeShot} onAdd={() => {setSelectedId(addShot({title:"New scene"}));setInspectorOpen(true);}} onAddVideo={() => {setSelectedId(addShot({kind:"video",title:"Motion shot",videoModel:"seedance-2.5"}));setInspectorOpen(true);}} />
            {!canvasOnly && <Timeline board={board} selectedId={selectedId} onSelect={id => {setSelectedId(id);setInspectorOpen(true);setChatOpen(false);}} onReorder={reorder} />}
          </> : panel === "wardrobe" ? <div className="overflow-auto"><CharactersPanel board={board} onChange={characters => setBoard(b => ({...b,characters}))} /></div> : panel === "moodboard" ? <MoodboardPanel /> : panel === "layers" ? <div className="p-6"><Button asChild><Link to="/layers">Open Layers Studio</Link></Button></div> : <section className="overflow-auto p-4"><h1 className="mb-4 text-xl font-bold">Scenes</h1><div className="director-scene-grid">{chainOrder(board).map(shot => <article key={shot.id} className="overflow-hidden rounded-lg border border-border bg-card">{shot.imageUrl && <img src={shot.imageUrl} alt={shot.title} className="aspect-video w-full object-cover" />}<div className="p-3"><h2 className="text-sm font-bold">{shot.title}</h2><Button className="mt-2" size="sm" variant="outline" onClick={() => {selectPanel("storyboard");setSelectedId(shot.id);setInspectorOpen(true);}}>Open shot</Button></div></article>)}</div></section>}
        </div>
        {(inspectorOpen || chatOpen) && <aside className="director-detail-panel border-l border-border bg-background"><div className="flex items-center justify-between border-b border-border p-3"><h2 className="text-sm font-bold">{chatOpen ? "Aurora Director" : "Inspector"}</h2><Button variant="ghost" size="icon" aria-label="Close panel" onClick={() => {setInspectorOpen(false);setChatOpen(false);}}><X /></Button></div><div className="min-h-0 flex-1 overflow-auto">{chatOpen ? <DirectorChat board={board} onAccept={patch => {setSelectedId(addShot(patch));selectPanel("storyboard");}} /> : selected ? <Inspector key={selected.id} shot={selected} board={board} onChange={patch => updateShot(selected.id,patch)} onDelete={() => {removeShot(selected.id);setSelectedId(null);}} /> : <p className="p-4 text-sm text-muted-foreground">No shot selected.</p>}</div></aside>}
      </div>
    </div>
  </main>;
}
