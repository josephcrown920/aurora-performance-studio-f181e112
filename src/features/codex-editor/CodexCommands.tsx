import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Send, X } from 'lucide-react';
import { loadTimeline, type TimelineDoc } from '@/features/creative-studio/lib/timeline-state';
import { previewCodexEdit } from './timeline-adapter';

export function CodexCommands() {
  const [doc, setDoc] = useState(loadTimeline);
  const [selected, setSelected] = useState<string>();
  const [time, setTime] = useState(0);
  const [command, setCommand] = useState('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<{ doc: TimelineDoc; summary: string; base: string }>();
  useEffect(() => {
    const change = (e: Event) => setDoc((e as CustomEvent<TimelineDoc>).detail);
    const seek = (e: Event) => setTime((e as CustomEvent<number>).detail);
    window.addEventListener('aurora:timeline-change', change);
    window.addEventListener('aurora:playhead-change', seek);
    return () => { window.removeEventListener('aurora:timeline-change', change); window.removeEventListener('aurora:playhead-change', seek); };
  }, []);
  function preview() {
    try { const base = loadTimeline(); setPending({ ...previewCodexEdit(base, selected, time, command), base: JSON.stringify(base) }); setNote(''); }
    catch (error) { setNote(error instanceof Error ? error.message : 'Edit could not be prepared'); }
  }
  function approve() {
    if (!pending) return;
    if (JSON.stringify(loadTimeline()) !== pending.base) { setPending(undefined); setNote('Timeline changed. Review this command again.'); return; }
    window.dispatchEvent(new CustomEvent('aurora:apply-doc', { detail: pending.doc }));
    setNote(pending.summary); setPending(undefined); setCommand('');
  }
  return <section aria-label="Codex editing commands" className="min-w-0 space-y-4 py-4">
    <h2 className="text-lg font-semibold">Codex assistant</h2><p className="text-xs text-muted-foreground">Pick a clip, describe the cut (for example “split at 3”), review it, then apply.</p>
    <Select value={selected ?? ''} onValueChange={setSelected}><SelectTrigger aria-label="Codex selected clip"><SelectValue placeholder="Select clip" /></SelectTrigger><SelectContent>{doc.clips.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
    <Textarea aria-label="Codex editing command" value={command} onChange={e => setCommand(e.target.value)} placeholder="Describe your edit…" maxLength={1000} />
    <Button onClick={preview} disabled={!command.trim()}><Send className="size-4" /> Review edit</Button>
    {pending && <div className="space-y-3 border-l-2 border-primary pl-3"><p>{pending.summary}</p><div className="flex gap-2"><Button onClick={approve}><Check className="size-4" /> Apply edit</Button><Button variant="outline" onClick={() => setPending(undefined)}><X className="size-4" /> Cancel</Button></div></div>}
    {note && <p role="status" className="text-sm text-muted-foreground">{note}</p>}
  </section>;
}