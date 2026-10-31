import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Film, Workflow, Layers, Mic2, Home } from 'lucide-react';
import { VideoStudio } from '@/features/video-studio/VideoStudio';
import { CodexCommands } from './CodexCommands';

export function CodexStudio() {
  return <main className="min-h-screen bg-background text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
      <h1 className="text-xl font-semibold">Aurora · Codex Studio</h1>
      <nav aria-label="Studio navigation" className="flex flex-wrap gap-1">
        <Button asChild variant="ghost" size="sm"><Link to="/" title="Home"><Home className="size-4" /><span className="sr-only">Home</span></Link></Button>
        <Button variant="secondary" size="sm" aria-current="page"><Film className="size-4" /> Editor</Button>
        <Button asChild variant="ghost" size="sm"><Link to="/studio" search={{ mode: 'canvas' }}><Workflow className="size-4" /> Canvas</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link to="/layers"><Layers className="size-4" /> Layers</Link></Button>
        <Button asChild variant="ghost" size="sm"><Link to="/studio" search={{ mode: 'perform' }}><Mic2 className="size-4" /> Perform</Link></Button>
      </nav>
    </header>
    <div className="min-w-0 px-3 py-4 sm:px-6"><VideoStudio /><CodexCommands /></div>
  </main>;
}