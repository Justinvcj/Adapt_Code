/* AdaptCode design preview — data is sample data, interactions are illustrative. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- logo ---------- */
  const MARK = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path class="lg-a" pathLength="1" d="M9 40 24 8l15 32" stroke="currentColor" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="lg-bar" pathLength="1" d="M15.6 27H30" stroke="currentColor" stroke-width="5.2" stroke-linecap="round"/>
    <circle class="lg-node" cx="32.9" cy="27" r="5.6"/>
  </svg>`;
  $$('[data-logo]').forEach(el => {
    el.classList.add('logo');
    el.innerHTML = MARK + (el.dataset.logo === 'word' ? '<span class="logo-word">AdaptCode</span>' : '');
  });
  const play = el => { el.classList.remove('is-drawing'); void el.offsetWidth; el.classList.add('is-drawing'); };

  const splash = $('#splash');
  // the intro plays once per browser session; the Brand screen can replay it
  let seen = false;
  try { seen = sessionStorage.getItem('ac-intro') === '1'; sessionStorage.setItem('ac-intro', '1'); } catch {}
  if (reduced || seen) { splash.style.transition = 'none'; splash.classList.add('is-done'); }
  else setTimeout(() => splash.classList.add('is-done'), 2150);
  $('#brand-replay').addEventListener('click', () => play($('#brand-anim')));

  /* ---------- concepts ---------- */
  const GATE = 0.85;
  const C = [
    { id: 'syntax',  name: 'Basic syntax',        pre: [],                  x: 60, y: 280, v: .96, solved: 9 },
    { id: 'loops',   name: 'Loops',               pre: ['syntax'],          x: 190, y: 280, v: .91, solved: 8 },
    { id: 'arrays',  name: 'Arrays',              pre: ['loops'],           x: 330, y: 150, v: .88, solved: 7 },
    { id: 'recur',   name: 'Recursion',           pre: ['loops'],           x: 330, y: 420, v: .58, solved: 4 },
    { id: 'strings', name: 'Strings',             pre: ['arrays'],          x: 500, y: 40,  v: .72, solved: 6 },
    { id: 'hash',    name: 'Hashing',             pre: ['arrays'],          x: 500, y: 115, v: .64, solved: 5 },
    { id: 'twoptr',  name: 'Two pointers',        pre: ['arrays'],          x: 500, y: 190, v: .41, solved: 2 },
    { id: 'bsearch', name: 'Binary search',       pre: ['arrays'],          x: 500, y: 265, v: .52, solved: 3 },
    { id: 'window',  name: 'Sliding window',      pre: ['twoptr'],          x: 670, y: 190, v: .12, solved: 0 },
    { id: 'back',    name: 'Backtracking',        pre: ['recur'],           x: 500, y: 345, v: .10, solved: 0 },
    { id: 'trees',   name: 'Trees',               pre: ['recur'],           x: 500, y: 420, v: .10, solved: 0 },
    { id: 'dp',      name: 'Dynamic programming', pre: ['recur'],           x: 500, y: 495, v: .08, solved: 0 },
  ];
  const by = id => C.find(c => c.id === id);
  const learned = c => c.v >= GATE;
  const open = c => c.pre.every(p => learned(by(p)));
  const focusOf = list => list.filter(c => open(c) && !learned(c)).sort((a, b) => a.v - b.v)[0];
  const pct = v => Math.round(v * 100) + '%';

  const R = 22;
  function drawGraph(svg, list) {
    const edges = list.flatMap(c => c.pre.map(p => {
      const a = list.find(n => n.id === p), mx = (a.x + c.x) / 2;
      return `<path class="edge" data-to="${c.id}" d="M${a.x + R} ${a.y}C${mx} ${a.y} ${mx} ${c.y} ${c.x - R} ${c.y}"/>`;
    })).join('');
    const nodes = list.map(c => `
      <g class="node" data-id="${c.id}" tabindex="0">
        <circle class="node-bg" cx="${c.x}" cy="${c.y}" r="${R}"/>
        <circle class="node-ring" cx="${c.x}" cy="${c.y}" r="${R}" pathLength="100" stroke-dasharray="100" transform="rotate(-90 ${c.x} ${c.y})"/>
        <text class="node-pct" x="${c.x}" y="${c.y + 5}"></text>
        <use class="node-lock icon" href="#i-lock" x="${c.x - 8}" y="${c.y - 8}" width="16" height="16"/>
        <text class="node-label" x="${c.x}" y="${c.y + R + 18}" text-anchor="middle">${c.name}</text>
      </g>`).join('');
    svg.innerHTML = edges + nodes;
    syncGraph(svg, list);
  }
  function syncGraph(svg, list) {
    const f = focusOf(list);
    list.forEach(c => {
      const g = $(`[data-id="${c.id}"]`, svg), isOpen = open(c);
      g.classList.toggle('locked', !isOpen);
      g.classList.toggle('focus', f && f.id === c.id);
      $('.node-ring', g).style.strokeDashoffset = isOpen ? 100 - c.v * 100 : 100;
      $('.node-pct', g).textContent = isOpen ? Math.round(c.v * 100) : '';
      const lock = $('.node-lock', g);
      lock.style.display = isOpen ? 'none' : '';
      lock.style.color = 'var(--ink-3)';
      $$(`.edge[data-to="${c.id}"]`, svg).forEach(e => e.classList.toggle('live', isOpen));
    });
  }

  /* landing demo: its own copy of the data so it can be played with */
  const demo = C.map(c => ({ ...c }));
  const demoSvg = $('#demo-graph');
  drawGraph(demoSvg, demo);
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
  function demoNext() {
    const f = focusOf(demo);
    if (!f) { $('#demo-title').textContent = 'Everything is learned'; $('#demo-why').textContent = 'Nothing left on this map'; $('#demo-solve').disabled = true; return; }
    const pool = TITLES[f.id] || ['Practice problem'];
    turn[f.id] = (turn[f.id] ?? -1) + 1;
    $('#demo-title').textContent = pool[turn[f.id] % pool.length];
    $('#demo-why').textContent = `Next, because ${f.name} is your weakest open topic at ${pct(f.v)}`;
  }
  demoNext();
  $('#demo-solve').addEventListener('click', () => {
    const f = focusOf(demo);
    if (!f) return;
    f.v = Math.min(.97, f.v + .17);
    syncGraph(demoSvg, demo);
    demoNext();
  });

  /* mastery page */
  drawGraph($('#m-graph'), C);
  const need = c => {
    if (!open(c)) return `Opens after ${c.pre.map(p => by(p).name).join(' and ')}`;
    if (learned(c)) return 'Learned';
    return c.solved >= 3 ? `${Math.round((GATE - c.v) * 100)} points to go` : `${c.solved} of 3 problems solved`;
  };
  const ring = (c, size = 44) => `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 44 44" style="--v:${open(c) ? c.v : 0}"><circle class="track" cx="22" cy="22" r="18" fill="none" stroke-width="4"/><circle class="fill" cx="22" cy="22" r="18" fill="none" stroke-width="4" pathLength="100"/></svg>`;
  $('#m-list').innerHTML = C.map(c => `
    <div class="concept ${open(c) ? '' : 'locked'}">
      ${ring(c)}
      <div><div class="row-title">${c.name}</div><div class="row-meta">${c.solved} solved</div></div>
      <div class="meter-cell"><div class="meter gate"><span style="--v:${open(c) ? c.v : 0}"></span></div></div>
      <div class="concept-need">${open(c) ? `<span class="pct">${pct(c.v)}</span><br>` : ''}${need(c)}</div>
    </div>`).join('');
  $('#m-view').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', e.currentTarget).forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#m-map').hidden = b.dataset.v !== 'map';
    $('#m-list').hidden = b.dataset.v !== 'list';
  });

  /* today: open topics */
  $('#today-topics').insertAdjacentHTML('beforeend',
    C.filter(c => open(c) && !learned(c)).sort((a, b) => a.v - b.v).slice(0, 4).map(c => `
      <a class="row" href="#mastery"><div class="row-main"><div class="row-title">${c.name}</div>
      <div class="meter gate" style="margin-top:8px"><span style="--v:${c.v}"></span></div></div>
      <div class="row-end t-num" style="color:var(--ink);font-weight:650">${pct(c.v)}</div></a>`).join(''));

  /* ---------- problems ---------- */
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
  const pips = d => `<span class="pips" aria-label="${['', 'Easy', 'Medium', 'Hard'][d]}">${[1, 2, 3].map(i => `<i class="${i <= d ? 'on' : ''}"></i>`).join('')}</span>`;
  const status = s => s === 'done' ? `<span class="check" title="Solved"><svg class="icon"><use href="#i-check"/></svg></span>` : `<span class="check ${s}" title="${s === 'tried' ? 'Attempted' : 'Not started'}"></span>`;
  $('#p-topic').insertAdjacentHTML('beforeend', C.map(c => `<option value="${c.id}">${c.name}</option>`).join(''));
  let diff = 0;
  function listProblems() {
    const q = $('#p-search').value.trim().toLowerCase(), t = $('#p-topic').value;
    const rows = P.filter(p => (!q || p[0].toLowerCase().includes(q)) && (!t || p[1] === t) && (!diff || p[2] === diff));
    $('#p-body').innerHTML = rows.map(p => `<tr><td class="c-status">${status(p[4])}</td><td class="p-title">${p[0]}</td>
      <td class="hide-sm"><span class="tag">${by(p[1]).name}</span></td><td>${pips(p[2])}</td><td class="c-num hide-sm">${p[3]}%</td></tr>`).join('');
    $('#p-empty').hidden = rows.length > 0;
  }
  listProblems();
  $('#p-search').addEventListener('input', listProblems);
  $('#p-topic').addEventListener('change', listProblems);
  $('#p-diff').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    diff = +b.dataset.d; $$('button', e.currentTarget).forEach(x => x.setAttribute('aria-pressed', x === b)); listProblems();
  });
  $('#p-body').addEventListener('click', () => { location.hash = 'work'; });

  /* ---------- workspace ---------- */
  $('#w-tabs').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', e.currentTarget).forEach(x => x.setAttribute('aria-selected', x === b));
    $$('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== b.dataset.tab);
  });
  const caseRow = (n, input, ok) => `<div class="case"><b>Test ${n}</b><span>${input}</span><span class="${ok ? 'ok' : 'no'}">${ok ? 'Passed' : 'Failed'}</span></div>`;
  const verdict = (cls, text, time = '') => { const v = $('#w-verdict'); v.className = 'verdict ' + cls; v.lastChild.textContent = text; $('#w-time').textContent = time; };
  $('#w-run').addEventListener('click', () => {
    verdict('pass', 'Both example tests passed', '38 ms');
    $('#w-cases').innerHTML = caseRow(1, '[2, 5, 8, 12, 17], 21', true) + caseRow(2, '[9, 14], 10', true);
    $('#w-gain').classList.remove('is-on');
  });
  $('#w-submit').addEventListener('click', () => {
    verdict('pass', 'Accepted, 12 of 12 tests', '212 ms');
    $('#w-cases').innerHTML = '';
    $('#w-gain').classList.add('is-on');
    requestAnimationFrame(() => requestAnimationFrame(() => $('#w-gain-bar').style.setProperty('--v', .58)));
  });

  /* ---------- leaderboard, heatmap ---------- */
  const LB = [['Aarav S', 34, 7], ['Meera K', 29, 6], ['Justin V', 21, 3], ['Daniel O', 18, 4], ['Priya N', 15, 3], ['Tomás R', 12, 2], ['Lin W', 9, 2]];
  $('#lb').innerHTML = LB.map((r, i) => `<div class="row ${r[0] === 'Justin V' ? 'me' : ''}"><span class="rank">${i + 1}</span>
    <span class="avatar">${r[0].split(' ').map(w => w[0]).join('')}</span><div class="row-main"><div class="row-title">${r[0]}${r[0] === 'Justin V' ? ' (you)' : ''}</div>
    <div class="row-meta">${r[2]} topics learned</div></div><div class="row-end t-num" style="color:var(--ink);font-weight:650">${r[1]} solved</div></div>`).join('');
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  $('#heat').innerHTML = Array.from({ length: 26 * 7 }, (_, i) => {
    const r = rnd() * (0.55 + i / 260), l = r < .42 ? 0 : r < .6 ? 1 : r < .78 ? 2 : r < .92 ? 3 : 4;
    return `<i data-l="${l}"></i>`;
  }).join('');

  /* ---------- small controls ---------- */
  document.addEventListener('click', e => {
    const sw = e.target.closest('.switch:not([data-theme-toggle])');
    if (sw) sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true');
    const seg = e.target.closest('.seg:not([id]) button');
    if (seg) $$('button', seg.parentElement).forEach(x => x.setAttribute('aria-pressed', x === seg));
    const ch = e.target.closest('.choice');
    if (ch) $$('.choice', ch.parentElement).forEach(x => x.setAttribute('aria-pressed', x === ch));
  });
  const root = document.documentElement;
  const setTheme = t => { root.dataset.theme = t; $$('.switch[data-theme-toggle]').forEach(s => s.setAttribute('aria-checked', t === 'dark')); };
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')));

  /* ---------- router ---------- */
  const BARE = ['landing', 'login', 'onboarding'];
  function route() {
    const name = location.hash.slice(1) || 'landing';
    const target = $(`[data-screen="${name}"]`) ? name : 'landing';
    $$('.screen').forEach(s => s.classList.toggle('is-active', s.dataset.screen === target));
    $('#bar').style.display = BARE.includes(target) ? 'none' : '';
    $$('.bar-nav a').forEach(a => a.getAttribute('href') === '#' + target ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    $$('.proto a').forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + target));
    scrollTo(0, 0);
  }
  addEventListener('hashchange', route);
  route();
})();
