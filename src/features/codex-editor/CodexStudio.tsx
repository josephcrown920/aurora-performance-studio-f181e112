import { Link } from '@tanstack/react-router';
import { Film, Workflow, Layers, Mic2, Home, Sparkles } from 'lucide-react';
import { VideoStudio } from '@/features/video-studio/VideoStudio';
import { CodexCommands } from './CodexCommands';

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/studio', search: { mode: 'canvas' }, label: 'Canvas', icon: Workflow },
  { to: '/layers', label: 'Layers', icon: Layers },
  { to: '/studio', search: { mode: 'perform' }, label: 'Perform', icon: Mic2 },
] as const;

export function CodexStudio() {
  return <main className="codex-theme min-h-screen">
    <header className="flex h-16 items-center gap-3 border-b border-border px-4 sm:px-6">
      <span className="grid size-9 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary"><Sparkles className="size-4" /></span>
      <div className="min-w-0">
        <h1 className="text-base font-semibold leading-tight">Codex Studio</h1>
        <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">Aurora · Shared timeline</p>
      </div>
      <div className="flex-1" />
      <nav aria-label="Studio navigation" className="codex-glass flex items-center gap-1 rounded-xl p-1">
        <span aria-current="page" className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary"><Film className="size-3.5" /><span className="hidden sm:inline">Editor</span></span>
        {NAV.map(({ label, icon: Icon, ...link }) => (
          <Link key={label} {...link} title={label} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Icon className="size-3.5" /><span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </nav>
    </header>
    <div className="codex-layout min-w-0 p-3 sm:p-5">
      <div className="codex-glass min-w-0 rounded-2xl p-3 sm:p-4"><VideoStudio /></div>
      <aside className="codex-glass h-fit rounded-2xl px-4 codex-side"><CodexCommands /></aside>
    </div>
  </main>;
}
