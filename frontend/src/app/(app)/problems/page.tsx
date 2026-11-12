"use client";
import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, Filter, Shuffle, Bookmark, BookmarkCheck } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Sidebar from '@/components/adapt/Sidebar';
import Calendar from '@/components/adapt/Calendar';
import PotdCard from '@/components/adapt/PotdCard';
import { PROBLEMS } from '@/components/adapt/data';
import { PROBLEM_LIST } from '@/data/problems';
import { CONCEPTS, CONCEPT_BY_ID, type ConceptId } from '@/data/concepts';
import { problemsAPI, API_ENABLED } from '@/lib/api';

const SLUG_BY_ID: Record<number, string> = PROBLEM_LIST.reduce(
  (acc, p) => { acc[p.id] = p.slug; return acc; },
  {} as Record<number, string>,
);
const CONCEPT_IDS = new Set<ConceptId>(CONCEPTS.map((c) => c.id));

type Row = {
  id: number;
  title: string;
  diff: 'Easy' | 'Medium' | 'Hard';
  acc: number;
  st: '' | 'solved' | 'attempted';
  slug: string;
  concept?: ConceptId;
};

type SortKey = 'id' | 'acc' | 'diff';

const DIFF_WEIGHT: Record<Row['diff'], number> = { Easy: 1, Medium: 2, Hard: 3 };
const BOOKMARKS_KEY = 'adaptcode.bookmarks.v1';
const PAGE_SIZE = 50;

function hashToId(uuid: string): number {
  let h = 0;
  for (let i = 0; i < uuid.length; i++) h = ((h << 5) - h + uuid.charCodeAt(i)) | 0;
  return Math.abs(h) % 9999 + 1;
}

function titleToSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function loadBookmarks(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveBookmarks(set: Set<string>) {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(set))); } catch {}
}

export default function ProblemsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Row[]>(() =>
    PROBLEMS.map((p) => ({ ...p, slug: SLUG_BY_ID[p.id] ?? 'coming-soon' })),
  );
  const [isLive, setIsLive] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Row['diff']>('All');
  const [conceptFilter, setConceptFilter] = useState<ConceptId | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'solved' | 'attempted' | 'todo' | 'bookmarked'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => loadBookmarks());

  useEffect(() => {
    if (!API_ENABLED) return;
    (async () => {
      try {
        const res = await problemsAPI.list();
        const next: Row[] = res.data.map((p) => {
          const tag = p.concept_tag as ConceptId | undefined;
          return {
            id: hashToId(p.id),
            title: p.title,
            diff: (p.difficulty_level.charAt(0).toUpperCase() + p.difficulty_level.slice(1)) as Row['diff'],
            acc: 55 + ((hashToId(p.id) * 7) % 35),
            st: '',
            slug: titleToSlug(p.title),
            concept: tag && CONCEPT_IDS.has(tag) ? tag : undefined,
          };
        });
        setRows(next);
        setIsLive(true);
      } catch {
        /* keep mock fallback */
      }
    })();
  }, []);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(k); setSortDir(1); }
    setPage(1);
  };

  const toggleBookmark = useCallback((slug: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (difficultyFilter !== 'All' && p.diff !== difficultyFilter) return false;
      if (conceptFilter !== 'All' && p.concept !== conceptFilter) return false;
      if (statusFilter === 'solved' && p.st !== 'solved') return false;
      if (statusFilter === 'attempted' && p.st !== 'attempted') return false;
      if (statusFilter === 'todo' && p.st !== '') return false;
      if (statusFilter === 'bookmarked' && !bookmarks.has(p.slug)) return false;
      return true;
    });
  }, [search, rows, difficultyFilter, conceptFilter, statusFilter, bookmarks]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'id') cmp = a.id - b.id;
      else if (sortKey === 'acc') cmp = a.acc - b.acc;
      else if (sortKey === 'diff') cmp = DIFF_WEIGHT[a.diff] - DIFF_WEIGHT[b.diff];
      return cmp * sortDir;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Reset page when the filtered row-set shrinks below the current page.
  useEffect(() => { if ((page - 1) * PAGE_SIZE >= sorted.length) setPage(1); }, [sorted.length, page]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const solved = rows.filter((p) => p.st === 'solved').length;
  const total = isLive ? rows.length : 4033;
  const dashArr = total > 0 ? (solved / total) * 50.3 : 0;

  // Count problems per concept for the tag row
  const conceptCounts = useMemo(() => {
    const out = new Map<ConceptId, number>();
    for (const r of rows) if (r.concept) out.set(r.concept, (out.get(r.concept) ?? 0) + 1);
    return out;
  }, [rows]);

  const openRandom = () => {
    if (sorted.length === 0) return;
    const r = sorted[Math.floor(Math.random() * sorted.length)];
    router.push(`/problem/${r.slug}`);
  };

  return (
    <>
      <Navbar active="problems" />
      <div className="app-wrap">
        <Sidebar active="problems" />
        <div className="main">
          <div className="main-inner" style={{ maxWidth: 'none', padding: '12px 20px' }}>
            <PotdCard />
            {/* Concept tag row — real data, not demo strings */}
            <div className="tags-row">
              <span
                className={`tag-pill ${conceptFilter === 'All' ? 'tag-pill-act' : ''}`}
                onClick={() => { setConceptFilter('All'); setPage(1); }}
                style={conceptFilter === 'All' ? { background: 'var(--bg-active)', color: 'var(--tx)' } : undefined}
              >
                All <span className="tc">{rows.length}</span>
              </span>
              {CONCEPTS.map((c) => {
                const count = conceptCounts.get(c.id) ?? 0;
                const isActive = conceptFilter === c.id;
                return (
                  <span
                    key={c.id}
                    className="tag-pill"
                    onClick={() => { setConceptFilter(isActive ? 'All' : c.id); setPage(1); }}
                    style={isActive ? { background: 'var(--bg-active)', color: 'var(--tx)' } : undefined}
                  >
                    {c.title} <span className="tc">{count}</span>
                  </span>
                );
              })}
            </div>

            {/* Difficulty tabs — functional */}
            <div className="cat-tabs">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((t) => (
                <span
                  key={t}
                  className={`cat-tab ${difficultyFilter === t ? 'act' : ''}`}
                  onClick={() => { setDifficultyFilter(t); setPage(1); }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="ps-toolbar">
              <div className="ps-search">
                <Search />
                <input
                  placeholder="Search questions"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="ps-icons">
                <button
                  className={`ps-icon ${sortKey !== 'id' || sortDir !== 1 ? 'act' : ''}`}
                  title={`Sort by ${sortKey} (${sortDir === 1 ? 'asc' : 'desc'})`}
                  onClick={() => toggleSort(sortKey)}
                >
                  <ArrowUpDown />
                </button>
                <button
                  className={`ps-icon ${showFilters ? 'act' : ''}`}
                  title="Filters"
                  onClick={() => setShowFilters((v) => !v)}
                >
                  <Filter />
                </button>
              </div>
              <div className="ps-solved">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="var(--border)" strokeWidth="2" />
                  <circle cx="10" cy="10" r="8" fill="none" stroke="var(--solved)" strokeWidth="2"
                    strokeDasharray={`${dashArr.toFixed(1)} 50.3`} transform="rotate(-90 10 10)" />
                </svg>
                {solved}/{total} Solved
              </div>
              <button className="ps-icon" title="Open a random problem" onClick={openRandom}>
                <Shuffle />
              </button>
            </div>

            {showFilters && (
              <div
                style={{
                  display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                  padding: '10px 0 14px', borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 600 }}>Status</span>
                {(['All', 'solved', 'attempted', 'todo', 'bookmarked'] as const).map((s) => (
                  <span
                    key={s}
                    className={`cat-tab ${statusFilter === s ? 'act' : ''}`}
                    onClick={() => { setStatusFilter(s); setPage(1); }}
                    style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                  >
                    {s === 'bookmarked' ? '★ Bookmarked' : s}
                  </span>
                ))}
              </div>
            )}

            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th style={{ width: 48, cursor: 'pointer' }} onClick={() => toggleSort('id')}>#</th>
                  <th>Title</th>
                  <th style={{ width: 90, cursor: 'pointer' }} onClick={() => toggleSort('acc')}>Acceptance</th>
                  <th style={{ width: 80, cursor: 'pointer' }} onClick={() => toggleSort('diff')}>Difficulty</th>
                  <th style={{ width: 90 }}>Concept</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => {
                  const dc = p.diff === 'Easy' ? 'e' : p.diff === 'Medium' ? 'm' : 'h';
                  const bookmarked = bookmarks.has(p.slug);
                  const conceptName = p.concept ? CONCEPT_BY_ID[p.concept]?.title : '—';
                  return (
                    <tr key={`${p.id}-${p.slug}`}>
                      <td>{p.st === 'solved' ? <span className="solved-icon">✓</span> : p.st === 'attempted' ? <span className="attempted-icon">○</span> : ''}</td>
                      <td style={{ color: 'var(--tx-2)' }}>{p.id}.</td>
                      <td className="t-link">
                        <Link href={`/problem/${p.slug}`} style={{ color: 'inherit' }}>{p.title}</Link>
                      </td>
                      <td>{p.acc.toFixed(1)}%</td>
                      <td><span className={`diff diff-${dc}`}>{p.diff}</span></td>
                      <td style={{ color: 'var(--tx-2)', fontSize: 12 }}>{conceptName}</td>
                      <td
                        style={{ color: bookmarked ? 'var(--accent)' : 'var(--tx-3)', cursor: 'pointer' }}
                        onClick={() => toggleBookmark(p.slug)}
                        title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                      >
                        {bookmarked
                          ? <BookmarkCheck size={14} />
                          : <Bookmark size={14} />}
                      </td>
                    </tr>
                  );
                })}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 36, color: 'var(--tx-2)' }}>
                      No problems match your filters. <button
                        onClick={() => {
                          setSearch(''); setConceptFilter('All');
                          setDifficultyFilter('All'); setStatusFilter('All');
                        }}
                        style={{ color: 'var(--blue)', marginLeft: 6 }}
                      >Clear</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {sorted.length > PAGE_SIZE && (
              <Pager page={page} pageCount={pageCount} onJump={setPage} />
            )}
          </div>
        </div>
        <div className="right-sb">
          <Calendar />
        </div>
      </div>
    </>
  );
}

function Pager({ page, pageCount, onJump }: { page: number; pageCount: number; onJump: (p: number) => void }) {
  // Show first, last, current, and neighbours; collapse rest with ellipsis.
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const items: (number | '…')[] = [];
  for (let i = 0; i < list.length; i++) {
    if (i > 0 && list[i] - list[i - 1] > 1) items.push('…');
    items.push(list[i]);
  }
  return (
    <div className="ps-pg">
      <button className="pg-b" disabled={page <= 1} onClick={() => onJump(Math.max(1, page - 1))}>‹</button>
      {items.map((it, i) =>
        it === '…'
          ? <span key={`e-${i}`} className="pg-b" style={{ pointerEvents: 'none' }}>…</span>
          : <button key={it} className={`pg-b ${it === page ? 'act' : ''}`} onClick={() => onJump(it)}>{it}</button>,
      )}
      <button className="pg-b" disabled={page >= pageCount} onClick={() => onJump(Math.min(pageCount, page + 1))}>›</button>
    </div>
  );
}
