const fs = require('fs');

const CATS_ALL = ['Top Opportunities','NAC','NGFW','Zero Trust','SD-WAN','AI Cybersecurity','OT Security','Quantum Security','SASE'];
const CATS_5 = ['Top Opportunities','NAC','NGFW','Zero Trust','SD-WAN'];
const WEEKS = ["Dec 31","Jan 07","Jan 14","Jan 21","Jan 28","Feb 04","Feb 11","Feb 18","Feb 25","Mar 04","Mar 11","Mar 18","Mar 25","Apr 01","Apr 08","Apr 15","Apr 22","Apr 29","May 06","May 13","May 20","May 27","Jun 03","Jun 10","Jun 17","Jun 24","Jul 01","Jul 08","Jul 15","Jul 22","Jul 29"];

function parseRank(v) {
  if (!v || v.trim() === '' || v.trim() === '-') return null;
  const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
  return (isNaN(n) || n === 0) ? null : n;
}

function parseCSV(content) {
  const lines = content.split('\n').slice(4); // skip 3 header rows + column header
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { fields.push(cur); cur = ''; }
      else { cur += c; }
    }
    fields.push(cur);
    if (fields.length < 10) continue;
    const cat = fields[0].trim();
    if (!CATS_ALL.includes(cat)) continue;
    rows.push(fields);
  }
  return rows;
}

// Read the main consolidated file
const content = fs.readFileSync('/workspaces/default/code/src/imports/FORT_Week_Over_Week_Rankings___Clicks-_2026_-_9_Categories__1_.csv', 'utf8');
const rows = parseCSV(content);

// Deduplicate and build keyword map
const kwMap = {}; // cat -> { keyword -> data }
CATS_ALL.forEach(c => kwMap[c] = {});

for (const fields of rows) {
  const cat = fields[0].trim();
  const keyword = fields[1].trim().toLowerCase();
  if (!cat || !keyword) continue;
  if (kwMap[cat][keyword]) continue; // deduplicate
  
  const vol = parseInt(fields[2]) || 0;
  const funnel = fields[3].trim();
  const ranks = [];
  for (let i = 5; i <= 35; i++) {
    ranks.push(parseRank(fields[i]));
  }
  
  const baseline = ranks[0]; // Dec 31
  const jul01 = ranks[26];
  const current = ranks[30]; // Jul 29
  const delta = (current !== null && jul01 !== null) ? current - jul01 : null;
  const delta_baseline = (current !== null && baseline !== null) ? current - baseline : null;
  
  kwMap[cat][keyword] = { keyword, vol, funnel, ranks, baseline_rank: baseline, jul01_rank: jul01, current_rank: current, delta, delta_baseline };
}

// Build results
const result = { weeks: WEEKS, cat_stats: {}, grand_totals: {}, weekly_page1: {}, weekly_r1: {}, weekly_avg_rank: {}, cat_keywords: {} };

let grandTotal=0, grandR1=0, grandPage1=0, grandPage23=0, grandPage3p=0, grandNR=0;

CATS_ALL.forEach(cat => {
  const kws = Object.values(kwMap[cat]);
  result.cat_keywords[cat] = kws;
  
  const total = kws.length;
  let valid=0, rank1=0, improving=0, declining=0, tofu_mofu=0, bofu=0, not_ranking=0, tofu_r1=0, bofu_r1=0;
  let rankSum=0, rankCount=0;
  
  kws.forEach(k => {
    const r = k.current_rank;
    if (k.funnel === 'TOFU/MOFU') tofu_mofu++;
    else if (k.funnel === 'BOFU') bofu++;
    if (r === null) { not_ranking++; return; }
    valid++;
    if (r === 1) { rank1++; if(k.funnel==='TOFU/MOFU') tofu_r1++; if(k.funnel==='BOFU') bofu_r1++; }
    rankSum += r; rankCount++;
    if (k.baseline_rank !== null) {
      if (r < k.baseline_rank) improving++;
      else if (r > k.baseline_rank) declining++;
    }
    if (CATS_5.includes(cat)) {
      if (r <= 10) grandPage1++;
      else if (r <= 30) grandPage23++;
      else grandPage3p++;
    }
  });
  
  if (CATS_5.includes(cat)) {
    grandTotal += total;
    grandR1 += rank1;
    grandNR += not_ranking;
  }
  
  const page1_count = kws.filter(k => k.current_rank && k.current_rank <= 10).length;
  result.cat_stats[cat] = { total, valid, rank1, avg_rank: rankCount ? Math.round(rankSum/rankCount*10)/10 : 0,
    improving, declining, pct: (page1_count/total*100).toFixed(1), tofu_mofu, bofu, not_ranking, tofu_r1, bofu_r1 };
  
  // Weekly arrays
  const wp1=[], wr1=[], wavg=[];
  for (let w=0; w<31; w++) {
    let p1=0, r1=0, rsum=0, rcnt=0;
    kws.forEach(k => { const r=k.ranks[w]; if(r===null) return; if(r<=10) p1++; if(r===1) r1++; rsum+=r; rcnt++; });
    wp1.push(p1); wr1.push(r1); wavg.push(rcnt ? Math.round(rsum/rcnt*10)/10 : 0);
  }
  result.weekly_page1[cat]=wp1; result.weekly_r1[cat]=wr1; result.weekly_avg_rank[cat]=wavg;
});

result.grand_totals = { total: grandTotal, rank1: grandR1, page1: grandPage1, page23: grandPage23, page3plus: grandPage3p, not_ranking: grandNR };

fs.writeFileSync('/workspaces/default/code/parsed_9cat.json', JSON.stringify(result));
console.log('Done. Grand totals:', result.grand_totals);
CATS_ALL.forEach(cat => { const s=result.cat_stats[cat]; console.log(cat+':', JSON.stringify(s)); });
