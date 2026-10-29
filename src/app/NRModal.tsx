import { useState } from 'react';
import { NR_WEEKLY, type NRWeekly } from './keywords';

const NR = 101;
const mono = "'DM Mono',monospace";
const nrOf = (v: number | null | undefined) => (v == null ? NR : v);

// Same sparkline as the By Category tab: dark slate line, scaled to the keyword's own max rank, dot on latest week
function Trend({ ranks }: { ranks: (number | null)[]; color?: string }) {
  const W = 120, H = 28;
  const mapped = ranks.map(nrOf);
  if (!mapped.some(r => r < NR)) {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="Never ranked in 44 weeks">
        <line x1={2} x2={W - 2} y1={H / 2} y2={H / 2} stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  const maxR = Math.max(...mapped);
  const pts = mapped.map((r, i) => {
    const x = (i / (mapped.length - 1)) * (W - 4) + 2;
    const y = maxR === 1 ? 2 : ((r - 1) / (maxR - 1)) * (H - 4) + 2;
    return [x, y] as const;
  });
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label="44-week rank trend">
      <polyline points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} fill="none" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill="#1E293B" />
    </svg>
  );
}

const th = (align: 'left' | 'right' | 'center', extra?: object) => ({
  textAlign: align, padding: '8px 12px', color: 'var(--text3)', fontWeight: 600, fontFamily: mono, fontSize: 10, letterSpacing: '.06em', ...extra,
} as const);

const FUNNEL_BG: Record<string, [string, string]> = {
  TOFU: ['rgba(26,86,219,.12)', '#1A56DB'],
  MOFU: ['rgba(5,150,105,.12)', '#059669'],
  BOFU: ['rgba(180,83,9,.12)', '#B45309'],
};

function Row({ r, i, mode }: { r: NRWeekly; i: number; mode: 'current' | 'recovered' | 'newly' | 'still' }) {
  const last = r.ranks[r.ranks.length - 1];
  const prev = r.ranks[r.ranks.length - 2];
  const [bg, fg] = FUNNEL_BG[r.funnel] || FUNNEL_BG.TOFU;
  const fmt = (v: number | null) => (v == null ? NR : '#' + v);
  return (
    <tr style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
      <td style={{ padding: '6px 12px 6px 20px', color: 'var(--text1)', fontWeight: 500, fontSize: 12 }}>{r.kw}</td>
      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 700, borderRadius: 4, padding: '2px 6px', background: bg, color: fg, fontFamily: mono }}>{r.funnel}</span>
      </td>
      <td style={{ padding: '6px 12px', textAlign: 'right', color: 'var(--text2)', fontFamily: mono, fontSize: 11 }}>{r.sv > 0 ? r.sv.toLocaleString() : '-'}</td>
      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: mono, fontSize: 11, color: prev == null ? '#DC2626' : 'var(--text2)' }}>{fmt(prev)}</td>
      <td style={{ padding: '6px 12px', textAlign: 'right', fontFamily: mono, fontSize: 11, fontWeight: 700, color: last == null ? '#DC2626' : '#059669' }}>{fmt(last)}</td>
      <td style={{ padding: '4px 20px 4px 12px', textAlign: 'center' }}><Trend ranks={r.ranks} /></td>
    </tr>
  );
}

function Table({ rows, mode }: { rows: NRWeekly[]; mode: 'current' | 'recovered' | 'newly' | 'still' }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead style={{ background: 'var(--surface)' }}>
        <tr style={{ borderBottom: '2px solid var(--border)' }}>
          <th style={th('left', { paddingLeft: 20 })}>KEYWORD</th>
          <th style={th('center')}>FUNNEL</th>
          <th style={th('right')}>SV</th>
          <th style={th('right')}>LAST WEEK</th>
          <th style={th('right')}>THIS WEEK</th>
          <th style={th('center', { paddingRight: 20 })}>44-WK TREND</th>
        </tr>
      </thead>
      <tbody>{rows.map((r, i) => <Row key={r.cat + r.kw} r={r} i={i} mode={mode} />)}</tbody>
    </table>
  );
}

export default function NRModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'current' | 'last'>('current');
  const L = (r: NRWeekly) => r.ranks[r.ranks.length - 1];
  const P = (r: NRWeekly) => r.ranks[r.ranks.length - 2];
  const bySv = (a: NRWeekly, b: NRWeekly) => b.sv - a.sv || a.kw.localeCompare(b.kw);
  const current = NR_WEEKLY.filter(r => L(r) == null).sort(bySv);
  const lastWk = NR_WEEKLY.filter(r => P(r) == null);
  const recovered = NR_WEEKLY.filter(r => P(r) == null && L(r) != null).sort(bySv);
  const newly = NR_WEEKLY.filter(r => P(r) != null && L(r) == null).sort(bySv);
  const still = NR_WEEKLY.filter(r => P(r) == null && L(r) == null).sort(bySv);

  const cards = [
    { label: 'Not Ranking · Last Week', val: lastWk.length, sub: 'Wk43 · Oct 21', bg: 'linear-gradient(135deg,#475569,#1E293B)' },
    { label: 'Now Ranking · Recovered', val: recovered.length, sub: 'back on the SERP this week', bg: 'linear-gradient(135deg,#10B981,#047857)' },
    { label: 'Newly Not Ranking', val: newly.length, sub: 'dropped out this week', bg: 'linear-gradient(135deg,#F43F5E,#B91C1C)' },
    { label: 'Not Ranking · This Week', val: current.length, sub: 'Wk44 · Oct 28', bg: 'linear-gradient(135deg,#FB923C,#C2410C)' },
  ];

  const section = (title: string, rows: NRWeekly[], mode: 'recovered' | 'newly' | 'still', color: string) => (
    <div key={title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px 8px', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)' }}>{title}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: mono }}>({rows.length})</span>
      </div>
      {rows.length ? <Table rows={rows} mode={mode} /> : <div style={{ padding: '8px 20px 14px', fontSize: 12, color: 'var(--text3)' }}>None this week</div>}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 12, width: '100%', maxWidth: 900, maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setView(v => (v === 'current' ? 'last' : 'current'))}
              style={{ cursor: 'pointer', fontSize: 12, fontWeight: 800, fontFamily: mono, padding: '8px 14px', borderRadius: 8, border: '1px solid #0F172A', background: '#0F172A', color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(15,23,42,.35)' }}
            >
              {view === 'current' ? 'Last Week → This Week' : '← Current List'}
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text1)' }}>
              {view === 'current' ? 'Not Ranking Keywords' : 'Not Ranking · Wk43 vs Wk44'}
            </span>
            <span style={{ background: '#F97316', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px', fontFamily: mono }}>
              {view === 'current' ? current.length : lastWk.length} Keywords
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: mono }}>Source: Semrush</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 18, lineHeight: 1, padding: 2 }}>✕</button>
          </div>
        </div>

        {view === 'last' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {cards.map(c => (
              <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: '12px 14px', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
                <div style={{ fontSize: 9, letterSpacing: '.06em', fontFamily: mono, color: 'rgba(255,255,255,.85)', fontWeight: 700, textTransform: 'uppercase' }}>{c.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginTop: 4 }}>{c.val}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', marginTop: 2 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {view === 'current'
            ? <Table rows={current} mode="current" />
            : <>
                {section('Now Ranking — Recovered', recovered, 'recovered', '#059669')}
                {section('Newly Not Ranking', newly, 'newly', '#DC2626')}
                {section('Still Not Ranking', still, 'still', '#F97316')}
              </>}
        </div>

        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: mono }}>Trendline = 44 weeks, Dec 31 → Oct 28 · line scaled to each keyword's own rank range</span>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: mono }}>Click outside to close</span>
        </div>
      </div>
    </div>
  );
}
