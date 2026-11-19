import type { ReactNode } from "react";
import { Plus } from "lucide-react";

/**
 * The Perform Anywhere tool card, laid out like the Genjutsu workflow site:
 * a header, then numbered steps. Presentation only — the live workflow passes
 * its real controls in as children.
 */
export function GenjutsuSheet({ subtitle = "Motion transfer · Genjutsu", children, footer }: { subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return <div className="gj-sheet">
    <header className="gj-sheet-head"><strong>Perform Anywhere</strong><span>{subtitle}</span></header>
    <div className="gj-sheet-body">{children}</div>
    {footer && <footer className="gj-sheet-foot">{footer}</footer>}
  </div>;
}

export function GenjutsuStep({ n, title, badge, description, boxed = false, children }: { n: string; title: string; badge: string; description?: string; boxed?: boolean; children: ReactNode }) {
  return <section className={boxed ? "gj-step gj-step-boxed" : "gj-step"}>
    <div className="gj-step-head">
      <div><p className="gj-step-n">STEP {n}</p><h3>{title}</h3></div>
      <span className="gj-badge">{badge}</span>
    </div>
    {description && <p className="gj-step-desc">{description}</p>}
    {children}
  </section>;
}

export function GenjutsuModelNotes({ motion, scene }: { motion: string; scene: string }) {
  return <div className="gj-models">
    <div><p>MOTION &amp; VIDEO</p><span>{motion}</span></div>
    <div><p>SCENE PREPARATION</p><span>{scene}</span></div>
  </div>;
}

/** Signed-out preview of the same tool so visitors see exactly what they get. */
export const GENJUTSU_SLOTS = [
  ["Identity", "Avatar or character"],
  ["Outfit", "Clothing reference"],
  ["Location", "World or background"],
  ["Pose", "Body composition"],
  ["Props", "Cars, products, objects"],
] as const;

export function GenjutsuSlotPreview() {
  return <div className="gj-slots">{GENJUTSU_SLOTS.map(([label, hint]) => <div key={label} className="gj-slot" aria-disabled="true"><span className="gj-slot-plus"><Plus size={14} /></span><strong>{label}</strong><small>{hint}</small></div>)}</div>;
}
