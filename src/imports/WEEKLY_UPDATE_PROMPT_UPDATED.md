# Fortinet SEO Dashboard — Weekly Update Master Prompt

> **How to use:** Every week, attach the 5 CSV files listed below and paste this entire prompt. Claude will parse every CSV, recalculate all metrics, and update every affected section of `src/app/App.tsx` and `src/app/keywords.ts` in one pass. Read the **Summary of Changes** section at the end to confirm what was and was not updated.

---

## Context

You are updating the **Fortinet SEO Dashboard** — a React 18 SPA (`src/app/App.tsx` + `src/app/keywords.ts`). The dashboard has **7 tabs**:

| Tab ID | Tab Label | Primary Data Source(s) |
|---|---|---|
| `traffic` | Traffic Overview | SEO_Tracker_Weekly_Traffic_Metrics CSV |
| `gain-loss` | Gain & Loss | Wow_Dashboard_Data_-_Gain___Loss CSV |
| `position` | Position Overview | 9_Category_With_AIO_Data CSV |
| `kwh` | Keyword Ranking Health | No_Backlink CSV + 9_Category CSV |
| `by-cat` | By Category | Backlink_Data CSV + No_Backlink CSV |
| `risk` | Top Risk | 9_Category_With_AIO_Data CSV |
| `takeaways` | Key Takeaways | All CSVs combined |

**Current week being updated:** `[REPLACE WITH: e.g. Sep 30, 2026 / Wk40]`
**Previous week:** `[REPLACE WITH: e.g. Sep 23, 2026 / Wk39]`
**Baseline date (never changes):** Dec 31, 2025

---

## Attached CSV Files

| File | Tab(s) It Feeds |
|---|---|
| `SEO_Tracker_Weekly_Traffic_Metrics-[N].csv` | Traffic Overview tab |
| `Wow_Dashboard_Data_-_Gain___Loss-[N].csv` | Gain & Loss tab |
| `Wow_Dashboard_Data_-_Backlink_Data-[N].csv` | By Category tab (Backlink KWs filter) |
| `Wow_Dashboard_Data_-_No_Backlink-[N].csv` | By Category tab (No Backlink KWs filter) + KWH trendlines |
| `Wow_Dashboard_Data_-_9_Category_With_AIO_Data-[N].csv` | Position Overview, Top Risk, KWH, Key Takeaways |

> **STRICT RULE: Every CSV is the sole source of truth for its section. No external data, assumptions, or manual values. Replace ALL old data with newly calculated values.**

---

## CSV Structure Reference

### 1. SEO_Tracker_Weekly_Traffic_Metrics CSV

- **Header row:** Row 4 (0-indexed). Columns: `Category, Trend, Trend since..., Baseline vs Current %, Baseline vs Current Chg, Last Week's % Chg, Last Week's Chg, Baseline | Avg Oct-Dec 2025, [Week dates col 7 onward]`
- **Data rows start:** Row 5
- **Prev week column:** Second-to-last data column
- **Current week column:** Last data column
- **Key rows to extract** (by `Category` col value):

| Row label | What it maps to |
|---|---|
| `Branded traffic (GSC)` | Branded GSC KPI |
| `Non-branded traffic (GSC)` | Non-Branded GSC KPI |
| `/blog (GA)` | Blog GA KPI |
| `/cyberglossary (GA)` | Cyberglossary GA KPI |
| `/products (GA)` | Products GA KPI |
| `Direct (GA) (Valid - W/o downloads)` | Direct Relevant Traffic KPI |
| `Referrals (GA)` | Referrals GA KPI |
| All data rows (col 7 onward, 39 values) | `TRAFFIC_WEEKS` sparkline arrays in App.tsx |

- **WoW % change formula:** `(current - prev) / prev × 100`
- **WoW absolute change formula:** `current - prev`
- **Treat blank / `#REF!` / `#VALUE!` cells as:** `null` (not ranking / no data)

---

### 2. Wow_Dashboard_Data_-_Gain___Loss CSV

- **Report date header:** Row 0, col 1 (e.g. "Sep 13 - Sep 19, 2026")
- **5 sections** (identified by col 1 value):

| Section trigger (col 1) | Dashboard card |
|---|---|
| `Branded (GSC)` + col 4 = URL header | Branded GSC — Top Gaining URLs |
| `Branded (GSC)` + col 4 = Keywords header | Branded GSC — Top Gaining Keywords |
| `/blog (GA)` | /blog GA — Top Gaining URLs |
| `Direct (Relevant traffic)` | Direct Traffic — Top Gaining URLs |
| `Referrals (GA)` | Referrals GA — Top Gaining URLs |

- **Per section structure:** 3 data rows + "Top 3 Total" row
- **Columns per row:** `URL/Keyword | prev_week | curr_week | Change | % Change`
- **% Change = N/A when prev = 0:** Display as `+[curr].0%` (not "N/A") — use actual curr value as pct
- **Totals row:** Sum of change column; % = sum change / sum prev × 100 (or display `+[sum_curr].0%` if prev total = 0)
- **Date labels:** Both column headers (prev week range + current week range) must update
- **WoW Change badge (top right of each card):** `+[section_pct]% / +[section_chg]`

---

### 3. Wow_Dashboard_Data_-_Backlink_Data CSV

- **Header row:** Row 0 (no skip rows needed)
- **Data rows:** Row 1 onward (28 keywords max — backlink-supported)
- **Column layout:**
  - Col 0: Category
  - Col 1: Keyword
  - Col 2: Search Volume (SV)
  - Col 3: Funnel
  - Col 4: URL
  - **Col 5:** Dec 31, 2025 baseline rank ← `dec31`
  - **Cols 5–43:** 39 weekly ranks (Wk1=Dec31 through Wk39=current week)
  - **Col 43:** Current week rank ← `current_rank`
  - **Col 44:** WoW delta (current minus previous, positive = improved)
- **Null values:** `-`, `Not Ranking`, empty → `null`
- **Updates in code:** `BACKLINK_KWS` array in `src/app/keywords.ts`
- **Array shape per entry:**
  ```ts
  {keyword, category, vol_jan26:SV, funnel, ranks:[39 values|null], current_rank, delta, url?}
  ```
- **delta:** `prev_rank - current_rank` (positive = improved / gained positions)

---

### 4. Wow_Dashboard_Data_-_No_Backlink CSV

- **Skip rows:** 2 blank rows at top; header is Row 2
- **Data rows:** Row 3 onward (635 keywords)
- **Column layout:** Same as Backlink CSV (cols 0–4 meta, cols 5–43 = 39 weeks, col 44 = WoW delta)
- **Null values:** `-`, `Not Ranking`, `0`, empty → `null`
- **Updates in code:**
  1. `NO_BACKLINK_KWS` array in `src/app/keywords.ts` — full 39-week ranks per keyword
  2. **KWH trendlines:** The 50 keywords currently in `KWH_DATA` (in `App.tsx`) get their `ranks` array refreshed from this CSV. Match on `keyword` + `category`. Update `current_rank` and `delta` too.
- **KWH trendline update rule:** Only update the 50 existing KWH keywords' rank arrays from this file. Do NOT add or remove KWH keywords unless explicitly instructed.

---

### 5. Wow_Dashboard_Data_-_9_Category_With_AIO_Data CSV

- **Skip rows:** 3 metadata rows at top; header is Row 3
- **Data rows:** Row 4 onward (660 keywords, 9 categories)
- **Column layout:**
  - Col 0: Category
  - Col 1: Keyword
  - Col 2: SV
  - Col 3: Funnel
  - Col 4: URL
  - **Col 5:** Dec 31, 2025 baseline rank
  - **Cols 5–42:** 38 weekly ranks (Wk1–Wk38)
  - **Col 42:** Previous week rank (Wk38 = e.g. Sep 16)
  - **Col 43:** Previous week AIO data
  - **Col 44:** Current week rank (Wk39 = e.g. Sep 23) ← `sep23`
  - **Col 45:** Current week AIO data ← AIO flag (`Yes`/`No`/`1`/`0`/`Not Ranking`)
  - **Col 46:** WoW delta
- **Null / NR values:** `-`, `Not Ranking`, empty, `0` in rank cols → `null`

#### What this CSV updates:

**A. `WOW_MOVERS_FUNNEL` (Category Performance top gainers/decliners)**

```
d = prev_rank - current_rank   (positive d = gained = improved rank)
NR prev → ranked now: from=0, d=99   (new appearance = strong gainer)
Ranked prev → NR now: to=0, d=-99   (dropped off = strong decliner)
```

- Rebuild the entire `WOW_MOVERS_FUNNEL` object in `App.tsx` (lines ~157–203)
- One entry per keyword per funnel group (TOFU/MOFU/BOFU) per category
- Sort each funnel array: gainers first (d>0 highest first), then decliners (d<0), then stable (d=0)

**B. `AIO_BY_CAT` — AIO count per category**

- Count rows where AIO col (col 45) = `Yes` / `1` / `AIO` (truthy) per category
- Update the `AIO_BY_CAT` record in `App.tsx` (line ~1641):
  ```ts
  const AIO_BY_CAT: Record<string,number> = { 'NGFW': X, 'SD-WAN': X, ... }
  ```

**C. Position Overview stats** — recalculate per category from col 44 (current week):

| Metric | Formula |
|---|---|
| `rank1` | Count rows where current rank = 1 |
| `page1` | Count rows where current rank 1–10 |
| `not_ranking` | Count rows where current rank = null |
| `avg_rank` | Mean of non-null current ranks |
| `improving` | Count rows where WoW delta > 0 |
| `declining` | Count rows where WoW delta < 0 |

Update `CAT_PERF` or equivalent per-category stat object in `App.tsx`.

**D. Top Risk tab data** — recalculate from cols 5 (Dec31) and 44 (current):

| Section | Calculation |
|---|---|
| Total Decliners | Count rows where dec31 ≠ null AND current ≠ null AND current > dec31 |
| Not Ranking | Count rows where dec31 ≠ null AND current = null |
| Highest Vol at Risk | Max SV among keywords where current > 10 OR current = null |
| Most Affected Category | Category with highest (declining + NR from dec31 baseline) count |
| Top 15 Declining | Sort by (current - dec31) descending, top 15 |
| NR list | Dec31-ranked → NR on current week, sort by SV desc, show top 12 |
| Priority Risk Actions | Current rank > 10 OR null, sort by SV desc, grouped by funnel (TOFU/MOFU/BOFU), top 5 per funnel |

---

## Step-by-Step Update Instructions

### STEP 1 — Parse all 5 CSV files

Use Python to read each CSV and extract:
- Current week date label (from Gain/Loss CSV header)
- Previous week date label
- Week number (count non-null weeks in No_Backlink CSV header)
- All numeric data per section

### STEP 2 — Update Traffic Overview tab

In `App.tsx`, find the `TRAFFIC_DATA` / weekly arrays object and update:

1. All sparkline arrays — append/replace the current week value at the end of each 39-value array
2. KPI tile values:
   - Branded GSC: current week absolute + WoW % + WoW absolute
   - Non-Branded GSC: same
   - Direct Relevant: same
   - Referrals: same
   - /blog GA: same
3. Update the Traffic Overview date label badge (e.g. "Week of Sep 23, 2026")
4. Update the "39 Weeks · Dec 31 → [date]" badge in the header
5. **Complete Traffic Metrics — All Sources table:** the change column header must read `WoW Δ` with sub-label `[prev_date] → [current_date]` (e.g. `Sep 23 → Sep 30`). Never leave the previous sub-label (`Sep16→Sep23`). The WoW % / absolute values come from the Traffic CSV's last-week change columns.

### STEP 3 — Update Gain & Loss tab

Replace all 5 section data arrays with new CSV values:

1. **Branded GSC URLs** — 3 URL rows + totals. Update: URLs, prev values, curr values, change, % change, date column headers, WoW badge
2. **Branded GSC Keywords** — 3 keyword rows + totals (left + right columns both). Update same fields.
3. **/blog GA URLs** — 3 URL rows + totals. If prev=0, pct = `+${curr}.0%` (not N/A)
4. **Direct Relevant Traffic URLs** — 3 URL rows + totals
5. **Referrals GA URLs** — 3 URL rows + totals. If prev=0, pct = `+${curr}.0%` (not N/A). Totals row % = same rule.

Update the **report date** in all section headers:
- Card meta: `[prev_date] vs [current_date], [year]`
- Column headers: `[prev_date]` and `[current_date]`

### STEP 4 — Update By Category tab

#### Backlink KWs (BACKLINK_KWS in keywords.ts)
- For each keyword in Backlink CSV, find matching entry in BACKLINK_KWS by `keyword + category`
- Update: `ranks` array (full 39 weeks), `current_rank`, `delta`
- Do NOT reorder, add, or remove keywords unless the CSV itself has changed the list

#### No Backlink KWs (NO_BACKLINK_KWS in keywords.ts)
- Same as above — match by `keyword + category`, update `ranks`, `current_rank`, `delta`
- Preserve all other fields

#### De-duplication (applies to every By Category list)
- Each category list in `CAT_KEYWORDS` and `NO_BACKLINK_KWS` must contain each keyword **once** (case-insensitive match on `keyword`; keep the first occurrence). The CSV repeats some keywords (e.g. `network security firewall`, `security firewall` in NGFW; `iot network security` in NAC; keywords shared between Top Opportunities and NGFW / SD-WAN / NAC in No Backlink). In `keywords.ts` the raw arrays are wrapped by `uniqByKeyword(...)` — keep that wrapper.
- After de-duplication update the category dropdown counts (`NGFW (N keywords)`, `NAC (N keywords)`, `No Backlink KWs (N keywords)`, etc.) to the de-duplicated lengths. Rank-filter pill counts are computed automatically.

#### Category Deep-Dive — Keyword Position Table headers (update every week)
- `Δ WoW` sub-label → `WoW [prev_date] → [current_date]` (e.g. `WoW Sep 23 → Sep 30`)
- `[N]-Week Trend` sub-label → `Dec → [current_date]` (e.g. `Dec → Sep 30`)
- Prev / Latest column headers → `[prev_date]` / `[current_date]`
- These labels appear in BOTH the Backlink/No-Backlink table and the 9-category table — update all occurrences (search for old dates such as `Sep16 vs Sep23`, `Dec → Sep 23`).

### STEP 5 — Update Keyword Ranking Health (KWH) tab

Find `KWH_DATA` array in `App.tsx` (the 50-keyword trendline table):

For each of the 50 existing keywords:
- Look up in No_Backlink CSV by `keyword + category`
- Update: `ranks` array (39 values), `cur` (current rank or null), and derive `best`, `bestWks`, `worst`, `worstWks` from the new 39-value array
- **Do NOT add or remove keywords. Do NOT change `sv`, `funnel`, or `vol` values.**

Update the **KWH column header** from `Trendline (38W)` → `Trendline (39W)` (increment week count by 1 each update).

### STEP 6 — Update Position Overview tab

Using 9_Category CSV:

1. **WOW_MOVERS_FUNNEL** — full rebuild of the object (9 categories × TOFU/MOFU/BOFU)
   - Update the source comment date (e.g. `// Sep 23 → Sep 30 2026`)
2. **AIO_BY_CAT** — update all 9 category AIO counts
3. **Category stat object** (if present) — update rank1, page1, avg_rank, improving, declining, not_ranking per category
4. **Section heading date** — update to `Source: Semrush · All metrics · [current_date] · WoW vs [prev_date]`
5. **View lists (Rank 11–100, Not Ranking, AIO)** — `RANK_11_100`, `NOT_RANKING`, `AIO_KEYWORDS` must contain **no duplicate keywords**. Keep the raw arrays as `*_RAW` and expose the de-duplicated array through the `uniqKw(...)` helper (first occurrence wins, case-insensitive). The modal badge (`{RANK_11_100.length} Keywords`, `{AIO_KEYWORDS.length} Keywords`) and the "Scroll to view all N…" lines are computed from the de-duplicated length — do not hardcode them. Note: the KPI tiles show the tracked-row counts from the CSV (may be slightly higher than the unique lists); state this in the Summary.
6. **Category Performance — Unified Overview (card grid)** — cards must be **ordered by status**, best to worst: `VERY GOOD` → `GOOD` → `NEEDS ATTENTION` → `LOW PERFORMANCE`. Do not hand-order `CAT_ORDER`; the code computes `perfOf(cat)` and sorts (`SORTED_CATS`) by status, then by Page 1 % descending within a status. Status rules (unchanged): 
   - VERY GOOD: Page 1 % ≥ 90 AND avg rank ≤ 3.0
   - GOOD: Page 1 % ≥ 85 AND avg rank ≤ 4.0
   - NEEDS ATTENTION: Page 1 % ≥ 70
   - LOW PERFORMANCE: otherwise
   After updating `CAT_STATS`, confirm the resulting order in the Summary of Changes.

### STEP 7 — Update Top Risk tab

Using 9_Category CSV (col 5 = Dec31, col 44 = current week):

1. **Primary SEO Risk banner** — update date label to current week. If highest-volume NR keyword changes, update keyword/text.
2. **KPI cards:**
   - Total Decliners: recalculate
   - Not Ranking: recalculate (total NR on current week)
   - Highest Vol at Risk: highest SV keyword where current rank > 10 or null
   - Most Affected Category: category with most (declining + NR from Dec31)
3. **Top Declining Keywords** (15 rows) — full replacement, sorted by positions lost descending
4. **Not Ranking section** — full replacement, top 12 by SV, only keywords that had a Dec31 rank
5. **Priority Risk Actions** — full replacement, top 5 TOFU + top 5 MOFU + top 5 BOFU, sorted by SV within each funnel

### STEP 8 — Update header / global badges

In the main dashboard header:
1. `[N] at #1` badge → update to current week's total Rank #1 count (from 9_Category CSV)
2. `[N] Weeks Tracked` badge → increment by 1
3. Date badge → update to current week date (e.g. `Sep 30, 2026`)

### STEP 9 — Update Key Takeaways tab

Rewrite all 6 cards and 3 Action Priorities based on the updated data. Use only metrics derived from the 5 CSVs — no external assumptions.

**Card 1 — Traffic Overview:** Use Traffic CSV WoW figures for Branded GSC, /blog, Direct, Referrals
**Card 2 — Top Risk:** Use Top Risk recalculated data (biggest decliner, biggest NR, most at-risk category)
**Card 3 — Position Overview:** Use 9_Category CSV current week — Rank #1 count, page 1 %, best/worst category avg rank
**Card 4 — Keyword Ranking Health:** Summarize KWH tab — biggest recoveries, biggest declines, ZZ volatility patterns
**Card 5 — Gain & Loss:** Summarize Gain/Loss CSV — top URL gainer, top keyword gainer, biggest positive channels
**Card 6 — By Category / Backlink View:** Use WOW_MOVERS_FUNNEL WoW counts — best/worst WoW category momentum, backlink stat, at-risk pool

**Top 3 Action Priorities:** Derive from the data — the 3 highest-urgency SEO actions supported by actual metrics from the CSVs.

---

## Data Calculation Reference

### Rank parsing rules
```
'-', 'Not Ranking', '', null, 0  →  null  (not ranking)
'1' → 1 (integer)
Strip commas from numbers: '1,234' → 1234
```

### WoW delta (By Category / Position Overview)
```
delta = prev_rank - current_rank
  positive delta = improved (gained positions) ✅
  negative delta = declined (lost positions) ❌
  NR prev → ranked now: d = 99 (new appearance)
  Ranked prev → NR now: d = -99 (dropped off SERP)
```

### Positions lost (Top Risk Declining)
```
positions_lost = current_rank - dec31_rank
  Only include if both dec31 and current are non-null AND current > dec31
```

### Risk classification (Priority Risk Actions)
```
Good:   current rank 1–5
Stable: current rank 6–10
Risk:   current rank > 10 OR null
```

### AIO detection (9_Category CSV col 45)
```
Truthy AIO: 'Yes', '1', 'AIO', 'yes' → count += 1
Falsy:  'No', 'Not Ranking', '', '-', '0' → skip
```

### % change display
```
If prev > 0:  display as  +X.X%  (or -X.X%)
If prev = 0:  display as  +[curr].0%  (NEVER "N/A")
Totals row when prev_total = 0:  same rule
```

---

## Design Rules — DO NOT CHANGE

- No tab layout, color, font, spacing, or component structure
- No card order, icon, accent color, or heading text (except dates)
- No KPI card structure — only update the numbers inside
- No chart/sparkline rendering logic — only update the data arrays
- No changes to any tab not listed above
- No new keywords added to KWH_DATA unless explicitly requested
- No keywords removed from any array unless they are confirmed absent from the CSV — **exception:** duplicate keywords in the By Category lists and the Position Overview view lists (Rank 11–100, Not Ranking, AIO) are always removed (see Steps 4 and 6)
- Category card order in Position Overview is the one allowed ordering change: sort by status (Step 6.6)

---

## Output Format

After completing all updates, output a **Summary of Changes** in this exact format:

```
## Summary of Changes — [Current Week Date]

### ✅ Updated
- [ ] Traffic Overview: TRAFFIC_DATA arrays updated (39 weeks). KPI tiles updated.
- [ ] Gain & Loss: All 5 sections replaced. Date labels → [prev] vs [current].
- [ ] By Category — Backlink KWs: [N] keyword ranks updated in BACKLINK_KWS.
- [ ] By Category — No Backlink KWs: [N] keyword ranks updated in NO_BACKLINK_KWS.
- [ ] KWH Trendlines: 50 keyword rank arrays refreshed. Header → Trendline (39W).
- [ ] Position Overview: WOW_MOVERS_FUNNEL rebuilt. AIO_BY_CAT updated.
- [ ] Top Risk: All 5 sections recalculated. Total Decliners=[N], NR=[N].
- [ ] Header badges: [N] at #1, 39 Weeks Tracked, Sep 30 2026.
- [ ] Key Takeaways: All 6 cards + 3 Priorities rewritten with current week data.

- [ ] Rank 11–100 / Not Ranking / AIO lists de-duplicated (report unique counts vs KPI counts)
- [ ] By Category lists de-duplicated; dropdown counts updated
- [ ] Complete Traffic Metrics table change column labelled `[prev] → [current]`
- [ ] Deep-Dive table headers: `WoW [prev] → [current]` and `Dec → [current]`
- [ ] Category Performance cards ordered VERY GOOD → GOOD → NEEDS ATTENTION → LOW PERFORMANCE

### ⚠️ Not Updated (reason)
- [List anything skipped and why — e.g. "KWH keyword X not found in No_Backlink CSV — kept existing data"]

### 📊 Key Metrics This Week
- Rank #1 count: [N] / 660 ([%])
- Total Decliners (vs Dec 31): [N]
- Not Ranking: [N]
- Highest Vol at Risk: [keyword] ([SV]K) at Rank #[N]
- Most Affected Category: [Category] — [N] declining · [N] NR
- Best WoW gainer: [Category] net +[N] ([N] gaining vs [N] declining)
- Branded GSC WoW: [+/-N%] / [+/-N]
- Top Gain/Loss URL: [URL] [+/-N sessions]
```

---

## Quick Column Index Card

| CSV | Dec31 col | Prev week col | Current week col | AIO col |
|---|---|---|---|---|
| 9_Category_AIO | 5 | 42 | 44 | 45 |
| Backlink | 5 | 42 | 43 | — |
| No_Backlink | 5 | 42 | 43 | — |
| Traffic | col 7 = Dec31 | second-to-last | last | — |
| Gain/Loss | N/A | col B/C | col D/E | — |

---

*Generated: Sep 24, 2026 · Fortinet SEO Dashboard · src/app/App.tsx + src/app/keywords.ts*
