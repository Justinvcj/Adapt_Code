/* AdaptCode design preview v2 — sample data, illustrative interactions. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pct = v => Math.round(v * 100) + '%';

  /* ================= logo ================= */
  const MARK = `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <circle class="lg-halo" cx="43.8" cy="36" r="10"/>
    <path class="lg-l" pathLength="1" d="M12 54 32 10" stroke="currentColor" stroke-width="6.4" stroke-linecap="round"/>
    <path class="lg-r" pathLength="1" d="M32 10 52 54" stroke="currentColor" stroke-width="6.4" stroke-linecap="round"/>
    <path class="lg-bar" pathLength="1" d="M20.6 36H40" stroke="currentColor" stroke-width="6.4" stroke-linecap="round"/>
    <circle class="lg-hole lg-foot-l" cx="12" cy="54" r="1.5"/>
    <circle class="lg-hole lg-apex" cx="32" cy="10" r="1.5"/>
    <circle class="lg-hole lg-foot-r" cx="52" cy="54" r="1.5"/>
    <path class="lg-next" d="M49.6 30.2 56.4 23.4" stroke-width="2.6" stroke-linecap="round" stroke-dasharray=".1 4.6"/>
    <circle class="lg-end" cx="59" cy="20.8" r="2.4"/>
    <circle class="lg-node" cx="43.8" cy="36" r="6.6"/>
  </svg>`;
  const WORD = '<span class="logo-word">' + [...'AdaptCode'].map((ch, k) => `<span style="--k:${k}">${ch}</span>`).join('') + '</span>';
  $$('[data-logo]').forEach(el => {
    el.classList.add('logo');
    el.innerHTML = MARK + (el.dataset.logo === 'word' ? WORD : '');
  });
  const sizeLogos = () => $$('.logo').forEach(el => el.classList.toggle('sm', parseFloat(getComputedStyle(el).fontSize) <= 26));
  sizeLogos();
  const play = el => { el.classList.remove('is-drawing'); void el.offsetWidth; el.classList.add('is-drawing'); };

  const splash = $('#splash');
  let seen = false;
  try { seen = sessionStorage.getItem('ac-intro2') === '1'; sessionStorage.setItem('ac-intro2', '1'); } catch {}
  const introMs = (reduced || seen) ? 0 : 2750;
  if (!introMs) { splash.style.transition = 'none'; splash.classList.add('is-done'); }
  else setTimeout(() => splash.classList.add('is-done'), introMs);
  $('#brand-replay').addEventListener('click', () => play($('#brand-anim')));

  /* ================= topics ================= */
  const GATE = 0.85;
  const C = [
    { id: 'syntax',  name: 'Basic syntax',        pre: [],         x: 600,  y: 60,  v: .96, solved: 9, about: 'Variables, types, conditions and input.' },
    { id: 'loops',   name: 'Loops',               pre: ['syntax'], x: 600,  y: 185, v: .91, solved: 8, about: 'Repeating work, loop conditions and off-by-one errors.' },
    { id: 'arrays',  name: 'Arrays',              pre: ['loops'],  x: 400,  y: 310, v: .88, solved: 7, about: 'Indexing, traversal and changing a list in place.' },
    { id: 'recur',   name: 'Recursion',           pre: ['loops'],  x: 840,  y: 310, v: .58, solved: 4, about: 'Base cases, smaller subproblems and the call stack.' },
    { id: 'strings', name: 'Strings',             pre: ['arrays'], x: 130,  y: 440, v: .72, solved: 6, about: 'Characters, substrings and building text.' },
    { id: 'hash',    name: 'Hashing',             pre: ['arrays'], x: 290,  y: 440, v: .64, solved: 5, about: 'Instant lookup with maps and sets.' },
    { id: 'twoptr',  name: 'Two pointers',        pre: ['arrays'], x: 450,  y: 440, v: .41, solved: 2, about: 'Two markers moving through sorted data.' },
    { id: 'bsearch', name: 'Binary search',       pre: ['arrays'], x: 610,  y: 440, v: .52, solved: 3, about: 'Halving the search space each step.' },
    { id: 'back',    name: 'Backtracking',        pre: ['recur'],  x: 770,  y: 440, v: .10, solved: 0, about: 'Try a choice, undo it, try the next.' },
    { id: 'trees',   name: 'Trees',               pre: ['recur'],  x: 930,  y: 440, v: .10, solved: 0, about: 'Traversals and recursive structure.' },
    { id: 'dp',      name: 'Dynamic programming', pre: ['recur'],  x: 1090, y: 440, v: .08, solved: 0, about: 'Reusing answers to overlapping subproblems.' },
    { id: 'window',  name: 'Sliding window',      pre: ['twoptr'], x: 450,  y: 575, v: .12, solved: 0, about: 'A moving range over a sequence.' },
  ];
  const learned = c => c.v >= GATE;

  /* ================= map component ================= */
  const R = 38, RR = 31;
  function makeMap(svg, list, { compact = false, onPick = null } = {}) {
    const by = id => list.find(c => c.id === id);
    const open = c => c.pre.every(p => learned(by(p)));
    const focus = () => list.filter(c => open(c) && !learned(c)).sort((a, b) => a.v - b.v)[0];
    const kids = id => list.filter(c => c.pre.includes(id));
    let picked = null;

    svg.classList.toggle('map--compact', compact);
    const edges = list.flatMap(c => c.pre.map(p => {
      const a = by(p), my = (a.y + c.y) / 2;
      const d = `M${a.x} ${a.y + R}C${a.x} ${my + 14} ${c.x} ${my - 14} ${c.x} ${c.y - R}`;
      return `<path class="edge" data-from="${p}" data-to="${c.id}" d="${d}"/><path class="flow" data-from="${p}" data-to="${c.id}" d="${d}"/>`;
    })).join('');
    const nodes = list.map(c => `
      <g class="node" data-id="${c.id}" tabindex="0" role="button" aria-label="${c.name}">
        <g class="n-body">
          <circle class="n-halo" cx="${c.x}" cy="${c.y}" r="${R + 14}"/>
          <circle class="n-glass" cx="${c.x}" cy="${c.y}" r="${R}"/>
          <circle class="n-track" cx="${c.x}" cy="${c.y}" r="${RR}"/>
          <circle class="n-ring" cx="${c.x}" cy="${c.y}" r="${RR}" pathLength="100" transform="rotate(-90 ${c.x} ${c.y})" style="stroke-dashoffset:100"/>
          <use class="n-glyph" href="#c-${c.id}" x="${c.x - 13}" y="${c.y - 13}" width="26" height="26"/>
        </g>
        <text class="n-label" x="${c.x}" y="${c.y + R + 22}">${c.name}</text>
        <text class="n-pct" x="${c.x}" y="${c.y + R + 40}"></text>
      </g>`).join('');
    svg.innerHTML = edges + nodes;
    const nodeEl = id => $(`.node[data-id="${id}"]`, svg);

    function sync() {
      const f = focus();
      list.forEach(c => {
        const g = nodeEl(c.id), isOpen = open(c);
        g.classList.toggle('locked', !isOpen);
        g.classList.toggle('done', learned(c));
        g.classList.toggle('focus', !!f && f.id === c.id);
        $('.n-ring', g).style.strokeDashoffset = isOpen ? 100 - c.v * 100 : 100;
        $('.n-pct', g).textContent = isOpen ? pct(c.v) : 'Locked';
        $$(`.edge[data-to="${c.id}"]`, svg).forEach(e => e.classList.toggle('open', isOpen));
      });
    }

    // light a topic, everything it needs, and everything it opens, in a cascade
    function light(id) {
      $$('.lit', svg).forEach(e => { e.classList.remove('lit'); e.style.removeProperty('--d'); });
      svg.classList.toggle('has-active', !!id);
      if (!id) return;
      const depth = new Map([[id, 0]]);
      const walk = (start, next) => {
        let layer = [start], d = 0;
        while (layer.length) {
          d++;
          const nx = [];
          layer.forEach(n => next(n).forEach(m => { if (!depth.has(m)) { depth.set(m, d); nx.push(m); } }));
          layer = nx;
        }
      };
      walk(id, n => by(n).pre);
      walk(id, n => kids(n).map(k => k.id));
      depth.forEach((d, n) => { const g = nodeEl(n); g.classList.add('lit'); g.style.setProperty('--d', d); });
      $$('.edge, .flow', svg).forEach(e => {
        const a = e.dataset.from, b = e.dataset.to;
        if (depth.has(a) && depth.has(b)) { e.classList.add('lit'); e.style.setProperty('--d', Math.max(depth.get(a), depth.get(b))); }
      });
    }
    function pick(id) {
      picked = id;
      $$('.picked', svg).forEach(n => n.classList.remove('picked'));
      if (id) nodeEl(id).classList.add('picked');
      light(id);
      if (onPick && id) onPick(by(id), { open, by, kids });
    }
    function burst(id) { const g = nodeEl(id); g.classList.remove('burst'); void g.getBBox(); g.classList.add('burst'); }

    svg.addEventListener('pointerover', e => { const g = e.target.closest('.node'); if (g) light(g.dataset.id); });
    svg.addEventListener('pointerleave', () => light(picked));
    svg.addEventListener('focusin', e => { const g = e.target.closest('.node'); if (g) light(g.dataset.id); });
    svg.addEventListener('focusout', () => light(picked));
    const choose = e => { const g = e.target.closest('.node'); if (g) pick(g.dataset.id); };
    svg.addEventListener('click', choose);
    svg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(e); } });

    sync();
    return { sync, light, pick, burst, focus, open, by };
  }

  /* ---------- landing demo ---------- */
  const demoData = C.map(c => ({ ...c }));
  const demo = makeMap($('#demo-map'), demoData, { compact: true });
  const TITLES = {
    twoptr: ['Closest pair in a sorted shelf', 'Merge two guest lists', 'Trim the matching ends'],
    bsearch: ['First bad build', 'Smallest shelf that fits', 'Peak of the hill'],
    hash: ['Ticket queue window', 'First repeated badge', 'Group the anagram tags'],
    strings: ['Longest calm streak', 'Compress the log line'],
    recur: ['Count the staircase routes', 'Flatten the nested boxes', 'Mirror the sequence'],
    window: ['Busiest ten minutes', 'Longest run without repeats'],
    back: ['Seat the dinner guests', 'All balanced bracket sets'],
    trees: ['Mirror tree check', 'Deepest branch'],
    dp: ['Coin jar combinations', 'Cheapest path across the grid'],
  };
  const turn = {};
  const swap = (el, text) => { el.textContent = text; el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };
  function demoNext() {
    const f = demo.focus();
    if (!f) { swap($('#demo-title'), 'The whole map is lit'); $('#demo-why').textContent = 'Nothing left to learn here'; $('#demo-solve').disabled = true; return; }
    const pool = TITLES[f.id] || ['Practice problem'];
    turn[f.id] = (turn[f.id] ?? -1) + 1;
    swap($('#demo-title'), pool[turn[f.id] % pool.length]);
    $('#demo-why').textContent = `Next, because ${f.name} is your weakest open topic at ${pct(f.v)}`;
  }
  demoNext();
  let demoTimer;
  $('#demo-solve').addEventListener('click', () => {
    const f = demo.focus(); if (!f) return;
    const was = learned(f);
    f.v = Math.min(.97, f.v + .17);
    demo.sync(); demo.burst(f.id);
    if (!was && learned(f)) { demo.light(f.id); clearTimeout(demoTimer); demoTimer = setTimeout(() => demo.light(null), 2600); }
    demoNext();
  });
  // one attract pass after the intro: show what the weakest topic leads to
  setTimeout(() => { const f = demo.focus(); if (f && ['', 'landing'].includes(location.hash.slice(1))) { demo.light(f.id); setTimeout(() => demo.light(null), 2800); } }, introMs + 900);

  /* ---------- sign-in art ---------- */
  makeMap($('#auth-map'), C.map(c => ({ ...c })), { compact: true });

  /* ---------- mastery page with inspector ---------- */
  const ringSvg = (v, size, attr = '') => `<svg class="ring" ${attr} width="${size}" height="${size}" viewBox="0 0 44 44" style="--v:${v}"><circle class="track" cx="22" cy="22" r="18" fill="none" stroke-width="4"/><circle class="fill" cx="22" cy="22" r="18" fill="none" stroke-width="4" pathLength="100"/></svg>`;
  const tick = on => `<span class="check ${on ? '' : 'todo'}">${on ? '<svg class="icon"><use href="#i-check"/></svg>' : ''}</span>`;
  function inspect(c, { open, by, kids }) {
    const isOpen = open(c), opens = kids(c.id);
    $('#inspect').innerHTML = `<div class="swap" style="display:grid;gap:20px">
      <div class="inspect-head">
        <div class="ring-wrap">${ringSvg(0, 84, 'data-ring')}<b>${isOpen ? pct(c.v) : ''}</b>${isOpen ? '' : '<svg class="icon" style="position:absolute;color:var(--ink-3)"><use href="#i-lock"/></svg>'}</div>
        <div><h3>${c.name}</h3><span class="t-small">${!isOpen ? 'Locked' : learned(c) ? 'Learned' : 'In progress'}</span></div>
      </div>
      <p style="color:var(--ink-2)">${c.about}</p>
      ${isOpen && !learned(c) ? `<div><h4>To count as learned</h4><ul>
        <li>${tick(c.v >= GATE)}Reach 85% <span class="t-small t-num" style="margin-left:auto">${pct(c.v)}</span></li>
        <li>${tick(c.solved >= 3)}Solve three different problems <span class="t-small t-num" style="margin-left:auto">${Math.min(c.solved, 3)} of 3</span></li>
        <li>${tick(c.solved >= 4)}One of them above easy</li></ul></div>` : ''}
      ${c.pre.length ? `<div><h4>Needs</h4><ul>${c.pre.map(p => `<li>${tick(learned(by(p)))}${by(p).name}</li>`).join('')}</ul></div>` : ''}
      ${opens.length ? `<div><h4>Opens</h4><ul>${opens.map(k => `<li><svg class="icon" style="width:16px;height:16px;color:var(--tint)"><use href="#c-${k.id}"/></svg>${k.name}</li>`).join('')}</ul></div>` : ''}
      ${isOpen ? `<a class="btn btn-accent btn-block" href="#work">${learned(c) ? 'Review this topic' : 'Practise this topic'}</a>` : `<button class="btn btn-quiet btn-block" disabled style="opacity:.6">Learn ${c.pre.map(p => by(p).name).join(' and ')} first</button>`}
    </div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $('[data-ring]', $('#inspect'))?.style.setProperty('--v', isOpen ? c.v : 0)));
  }
  const mastery = makeMap($('#m-map'), C, { onPick: inspect });
  mastery.pick(mastery.focus().id);

  /* ---------- today, profile rings ---------- */
  const openList = C.filter(c => mastery.open(c) && !learned(c)).sort((a, b) => a.v - b.v);
  $('#today-topics').insertAdjacentHTML('beforeend', openList.slice(0, 4).map(c => `
    <a class="row" href="#mastery"><svg class="icon" style="color:var(--tint)"><use href="#c-${c.id}"/></svg><div class="row-main"><div class="row-title">${c.name}</div>
    <div class="meter" style="margin-top:8px"><span style="--v:${c.v}"></span></div></div>
    <div class="row-end t-num" style="color:var(--ink);font-weight:650">${pct(c.v)}</div></a>`).join(''));
  $('#p-rings').innerHTML = C.map(c => { const o = mastery.open(c); return `<div><div class="ring-wrap" style="width:54px;height:54px">${ringSvg(o ? c.v : 0, 54)}<b>${o ? Math.round(c.v * 100) : ''}</b></div>${c.name}</div>`; }).join('');

  /* ================= problems ================= */
  const P = [
    ['Closest pair in a sorted shelf', 'twoptr', 2, 62, 'todo'], ['Ticket queue window', 'hash', 2, 48, 'tried'],
    ['Rotate the playlist', 'arrays', 1, 81, 'done'], ['Longest calm streak', 'strings', 2, 55, 'done'],
    ['Mirror tree check', 'trees', 1, 77, 'done'], ['Coin jar combinations', 'dp', 3, 31, 'todo'],
    ['First bad build', 'bsearch', 1, 74, 'todo'], ['Seat the dinner guests', 'back', 3, 28, 'todo'],
    ['Count the staircase routes', 'recur', 1, 69, 'done'], ['Busiest ten minutes', 'window', 2, 44, 'todo'],
    ['Merge two guest lists', 'twoptr', 1, 83, 'done'], ['Group the anagram tags', 'hash', 2, 52, 'todo'],
    ['Sum the receipt lines', 'loops', 1, 92, 'done'], ['Swap without a spare', 'syntax', 1, 95, 'done'],
    ['Cheapest path across the grid', 'dp', 3, 26, 'todo'], ['Flatten the nested boxes', 'recur', 2, 47, 'tried'],
  ];
  const name = id => C.find(c => c.id === id).name;
  const pips = d => `<span class="pips" aria-label="${['', 'Easy', 'Medium', 'Hard'][d]}">${[1, 2, 3].map(i => `<i class="${i <= d ? 'on' : ''}"></i>`).join('')}</span>`;
  const status = s => s === 'done' ? `<span class="check" title="Solved"><svg class="icon"><use href="#i-check"/></svg></span>` : `<span class="check ${s}" title="${s === 'tried' ? 'Attempted' : 'Not started'}"></span>`;
  let diff = 0, topic = '';
  $('#p-topics').innerHTML = `<button aria-pressed="true" data-t=""><span>All topics<small>${P.length}</small></span></button>` +
    C.map(c => `<button aria-pressed="false" data-t="${c.id}"><span>${c.name}<small>${mastery.open(c) ? pct(c.v) : 'Locked'}</small></span><div class="meter"><span style="--v:${mastery.open(c) ? c.v : 0}"></span></div></button>`).join('');
  function listProblems() {
    const q = $('#p-search').value.trim().toLowerCase();
    const rows = P.filter(p => (!q || p[0].toLowerCase().includes(q)) && (!topic || p[1] === topic) && (!diff || p[2] === diff));
    $('#p-body').innerHTML = rows.map((p, i) => `<tr style="--i:${i}"><td class="c-status">${status(p[4])}</td><td class="p-title">${p[0]}</td>
      <td class="hide-sm"><span class="tag"><svg class="icon" style="width:14px;height:14px"><use href="#c-${p[1]}"/></svg>${name(p[1])}</span></td><td>${pips(p[2])}</td><td class="c-num hide-sm">${p[3]}%</td></tr>`).join('');
    $('#p-empty').hidden = rows.length > 0;
  }
  listProblems();
  $('#p-search').addEventListener('input', listProblems);
  $('#p-topics').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    topic = b.dataset.t; $$('button', e.currentTarget).forEach(x => x.setAttribute('aria-pressed', x === b)); listProblems();
  });
  $('#p-diff').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    diff = +b.dataset.d; $$('button', e.currentTarget).forEach(x => x.setAttribute('aria-pressed', x === b)); listProblems();
  });
  $('#p-body').addEventListener('click', () => { location.hash = 'work'; });

  /* ================= workspace ================= */
  $$('#w-code > div').forEach((d, i) => d.style.setProperty('--i', i));
  const line = $('#w-line');
  const moveLine = () => { const b = $('#w-tabs [aria-selected="true"]'); line.style.width = b.offsetWidth + 'px'; line.style.transform = `translateX(${b.offsetLeft}px)`; };
  $('#w-tabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', e.currentTarget).forEach(x => x.setAttribute('aria-selected', x === b));
    $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== b.dataset.tab; if (!p.hidden) { p.classList.remove('swap'); void p.offsetWidth; p.classList.add('swap'); } });
    moveLine();
  });
  const verdict = (cls, text, time = '') => { const v = $('#w-verdict'); v.className = 'verdict ' + cls; v.lastElementChild.textContent = text; $('#w-time').textContent = time; };
  const caseRow = (n, input, i) => `<div class="case" style="--i:${i}"><b>Test ${n}</b><span>${input}</span><span class="ok">Passed</span></div>`;
  let busy = false;
  $('#w-run').addEventListener('click', () => {
    if (busy) return; busy = true;
    $('#w-gain').classList.remove('is-on'); $('#w-cases').innerHTML = '';
    verdict('busy', 'Running the example tests');
    setTimeout(() => {
      verdict('pass', 'Both example tests passed', '38 ms');
      $('#w-cases').innerHTML = caseRow(1, '[2, 5, 8, 12, 17], 21', 0) + caseRow(2, '[9, 14], 10', 1);
      busy = false;
    }, reduced ? 0 : 700);
  });
  $('#w-submit').addEventListener('click', () => {
    if (busy) return; busy = true;
    $('#w-gain').classList.remove('is-on');
    verdict('busy', 'Running 12 hidden tests');
    $('#w-cases').innerHTML = Array.from({ length: 12 }, (_, i) => `<span class="dot ok" style="--i:${i}">${i + 1}</span>`).join('');
    setTimeout(() => {
      verdict('pass', 'Accepted, 12 of 12 tests', '212 ms');
      $('#w-ring').style.setProperty('--v', .41); $('#w-ring-n').textContent = '41%';
      $('#w-gain').classList.add('is-on');
      setTimeout(() => { $('#w-ring').style.setProperty('--v', .58); countTo($('#w-ring-n'), 41, 58, '%'); }, 350);
      busy = false;
    }, reduced ? 0 : 1150);
  });
  let secs = 372;
  setInterval(() => { if ($('[data-screen="work"]').classList.contains('is-active')) { secs++; $('#w-timer').textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0'); } }, 1000);

  /* ================= leaderboard, heatmap ================= */
  const LB = [['Aarav S', 34, 7], ['Meera K', 29, 6], ['Justin V', 21, 3], ['Daniel O', 18, 4], ['Priya N', 15, 3], ['Tomás R', 12, 2], ['Lin W', 9, 2]];
  const ini = n => n.split(' ').map(w => w[0]).join('');
  $('#podium').innerHTML = [[1, 'p2', 0], [0, 'p1', 1], [2, 'p3', 2]].map(([k, cls, i]) => `<div class="${cls}" style="--i:${i}"><span class="avatar">${ini(LB[k][0])}</span><b>${LB[k][0]}${LB[k][0] === 'Justin V' ? ' (you)' : ''}</b><span class="t-small t-num">${LB[k][1]} solved</span><span class="big-num" style="font-size:26px;color:${k ? 'var(--ink-3)' : 'var(--accent-ink)'}">${k + 1}</span></div>`).join('');
  $('#lb').innerHTML = LB.slice(3).map((r, i) => `<div class="row"><span class="rank">${i + 4}</span><span class="avatar">${ini(r[0])}</span><div class="row-main"><div class="row-title">${r[0]}</div><div class="row-meta">${r[2]} topics learned</div></div><div class="row-end t-num" style="color:var(--ink);font-weight:650">${r[1]} solved</div></div>`).join('');
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  $('#heat').innerHTML = Array.from({ length: 26 * 7 }, (_, i) => {
    const r = rnd() * (0.55 + i / 260), l = r < .42 ? 0 : r < .6 ? 1 : r < .78 ? 2 : r < .92 ? 3 : 4;
    return `<i data-l="${l}" style="--c:${Math.floor(i / 7)}"></i>`;
  }).join('');

  /* ================= small controls ================= */
  function countTo(el, from, to, suffix = '') {
    if (reduced) { el.textContent = to + suffix; return; }
    const t0 = performance.now(), dur = 900;
    const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e) + suffix; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  document.addEventListener('click', e => {
    const sw = e.target.closest('.switch:not([data-theme-toggle])');
    if (sw) sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true');
    const seg = e.target.closest('.seg:not([id]) button');
    if (seg) $$('button', seg.parentElement).forEach(x => x.setAttribute('aria-pressed', x === seg));
    const ch = e.target.closest('.choice');
    if (ch) $$('.choice', ch.parentElement).forEach(x => x.setAttribute('aria-pressed', x === ch));
    const proto = $('#proto');
    if (e.target.closest('#proto > button')) proto.classList.toggle('is-open'); else proto.classList.remove('is-open');
  });
  const root = document.documentElement;
  const setTheme = t => { if (t === 'light') root.dataset.theme = 'light'; else delete root.dataset.theme; $$('.switch[data-theme-toggle]').forEach(s => s.setAttribute('aria-checked', t === 'light')); };
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light')));

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ================= router ================= */
  const BARE = ['landing', 'login', 'onboarding'];
  const navLinks = $$('.side-nav a');
  function route() {
    const want = location.hash.slice(1) || 'landing';
    const target = $(`[data-screen="${want}"]`) ? want : 'landing';
    $$('.screen').forEach(s => s.classList.toggle('is-active', s.dataset.screen === target));
    document.body.dataset.shell = BARE.includes(target) ? 'bare' : 'app';
    let idx = -1;
    navLinks.forEach((a, i) => { const on = a.getAttribute('href') === '#' + target; if (on) { a.setAttribute('aria-current', 'page'); idx = i; } else a.removeAttribute('aria-current'); });
    const pill = $('#side-pill'); pill.style.opacity = idx < 0 ? 0 : 1; if (idx >= 0) pill.style.transform = `translateY(${idx * 44}px)`;
    $$('.proto-menu a').forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + target));
    $$(`[data-screen="${target}"] [data-count]`).forEach(el => countTo(el, 0, +el.dataset.count, el.dataset.suffix || ''));
    if (target === 'work') requestAnimationFrame(moveLine);
    sizeLogos();
    scrollTo(0, 0);
  }
  addEventListener('hashchange', route);
  addEventListener('resize', () => { if ($('[data-screen="work"]').classList.contains('is-active')) moveLine(); });
  route();
})();
