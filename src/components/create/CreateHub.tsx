import { Link } from "@tanstack/react-router";
import { HUB_TOOLS } from "./tools";

export function CreateHub() {
  return (
    <div className="create-hub min-h-screen pb-24">
      <section className="px-5 pt-10 pb-8 sm:px-10">
        <p className="hub-eyebrow">Every tool</p>
        <h1 className="hub-title">
          <span>Create</span>
          <span className="hub-outline">Something</span>
          <span>New.</span>
        </h1>
        <p className="hub-sub"><span className="hub-rule" />{HUB_TOOLS.length} tools · Built for artists</p>
      </section>
      <ul className="hub-list">
        {HUB_TOOLS.map((t, i) => (
          <li key={t.to}>
            <Link to={t.to} className="hub-row group">
              <img src={t.img} alt="" aria-hidden className="hub-bg" loading="lazy" />
              <span className="hub-num">{String(i).padStart(2, "0")}</span>
              <span className={t.cost === "FREE" ? "hub-cost hub-free" : "hub-cost"}>{t.cost}</span>
              <span className="hub-name">{t.name}</span>
              {t.badge && <span className="hub-badge">{t.badge}</span>}
              <span className="hub-tag">{t.tag}</span>
              <span className="hub-open">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
