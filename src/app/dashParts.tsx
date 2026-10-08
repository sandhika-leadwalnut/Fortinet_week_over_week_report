import { Home, ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Info, CheckCircle2, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export const CURRENT_WEEK = 'Wk41';

export type InsightTone = 'green' | 'red' | 'amber' | 'blue';
export type InsightItem = { tone: InsightTone; title: string; body: ReactNode; icon?: 'warn' | 'up' | 'down' | 'info' | 'ok' };

const ICONS = {
  warn: AlertTriangle,
  up: TrendingUp,
  down: TrendingDown,
  info: Info,
  ok: CheckCircle2,
};

export function KeyInsights({ items }: { items: InsightItem[] }) {
  return (
    <section className="fn-ki">
      <div className="fn-ki-head">
        <Sparkles size={16} strokeWidth={2.6} />
        <span className="fn-ki-title">Key Insights</span>
        <span className="fn-ki-week">{CURRENT_WEEK} · Oct 07, 2026</span>
      </div>
      <div className="fn-ki-grid">
        {items.map((it, i) => {
          const Icon = ICONS[it.icon ?? (it.tone === 'green' ? 'up' : it.tone === 'red' ? 'warn' : it.tone === 'amber' ? 'warn' : 'info')];
          return (
            <div key={i} className={`fn-ki-card fn-ki-${it.tone}`}>
              <div className="fn-ki-icon"><Icon size={20} strokeWidth={2.4} /></div>
              <div>
                <div className="fn-ki-card-title">{it.title}</div>
                <div className="fn-ki-body">{it.body}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TabHead({ eyebrow, title, sub, onHome, accent = '#D93025' }: { eyebrow: string; title: string; sub: string; onHome: () => void; accent?: string }) {
  return (
    <div className="fn-tabhead">
      <button className="fn-home-btn" onClick={onHome} title="Back to Table of Contents" aria-label="Back to Home">
        <Home size={20} strokeWidth={2.4} />
      </button>
      <div className="fn-tabhead-bar" style={{ background: accent }} />
      <div>
        <div className="fn-tabhead-eyebrow" style={{ color: accent }}>{eyebrow}</div>
        <div className="fn-tabhead-title">{title}</div>
        <div className="fn-tabhead-sub">{sub}</div>
      </div>
    </div>
  );
}

type TocItem = { label: string; note?: string; tab: string; cat?: string };
type TocGroup = { no: string; title: string; color: string; bg: string; items: TocItem[]; wide?: boolean };

const GROUPS: TocGroup[] = [
  { no: '01', title: 'Traffic', color: '#0A7A55', bg: 'rgba(10,122,85,.14)', items: [{ label: 'Traffic Overview', note: 'GSC & GA organic, branded, pages, channels', tab: 'traffic' }] },
  {
    no: '02', title: 'Keywords', color: '#1A56DB', bg: 'rgba(26,86,219,.14)',
    items: [
      { label: 'Position Overview', note: 'Rank #1, Page 1 and trajectories', tab: 'overview' },
      { label: 'Keyword Performance', note: 'High-volume wins and funnel #1s', tab: 'kwperf' },
      { label: 'Keyword Position Insight', note: 'Gainers, decliners, holders, volatile', tab: 'position' },
    ],
  },
  {
    no: '03', title: 'Risk & Movement', color: '#D93025', bg: 'rgba(217,48,37,.14)',
    items: [
      { label: 'Top Risk', note: 'Not-ranking and declining priorities', tab: 'risk' },
      { label: 'Gain & Loss', note: 'Top gaining URLs and keywords', tab: 'gainloss' },
    ],
  },
  {
    no: '04', title: 'By Category', color: '#7C3AED', bg: 'rgba(124,58,237,.14)', wide: true,
    items: ['NGFW', 'SD-WAN', 'NAC', 'Zero Trust', 'Top Opportunities', 'AI Cybersecurity', 'OT Security', 'Quantum Security', 'SASE'].map(c => ({ label: c, tab: 'categories', cat: c })),
  },
];

export function HomePage({ onOpen }: { onOpen: (tab: string, cat?: string) => void }) {
  return (
    <div className="fn-toc">
      <div className="fn-toc-head">
        <h1>Table of Contents</h1>
        <div className="fn-toc-rule" />
        <p>Weekly SEO Performance · Select any section to open its slide</p>
        <div className="fn-toc-chips">
          <span>660 Keywords</span><span>9 Categories</span><span>41 Weeks</span><span className="hot">{CURRENT_WEEK} · Oct 07, 2026</span>
        </div>
      </div>
      <div className="fn-toc-grid">
        {GROUPS.map(g => (
          <div key={g.no} className={`fn-toc-card${g.wide ? ' wide' : ''}`} style={{ borderTopColor: g.color }}>
            <div className="fn-toc-card-head">
              <span className="fn-toc-no" style={{ color: g.color, background: g.bg }}>{g.no}</span>
              <div>
                <div className="fn-toc-card-title">{g.title}</div>
                <div className="fn-toc-card-count">{g.items.length} {g.items.length === 1 ? 'slide' : 'slides'}</div>
              </div>
            </div>
            <div className={`fn-toc-items${g.wide ? ' cols' : ''}`}>
              {g.items.map(it => (
                <button key={it.label} className="fn-toc-item" style={{ ['--c' as any]: g.color }} onClick={() => onOpen(it.tab, it.cat)}>
                  <span>
                    <span className="fn-toc-item-label">{it.label}</span>
                    {it.note && <span className="fn-toc-item-note">{it.note}</span>}
                  </span>
                  <ArrowRight size={16} strokeWidth={3} color={g.color} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
