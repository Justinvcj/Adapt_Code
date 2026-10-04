"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowUpDown, Filter, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/adapt/Navbar';
import Sidebar from '@/components/adapt/Sidebar';
import Calendar from '@/components/adapt/Calendar';
import { PROBLEMS, TAGS } from '@/components/adapt/data';
import { PROBLEM_LIST } from '@/data/problems';

const SLUG_BY_ID: Record<number, string> = PROBLEM_LIST.reduce((acc, p) => { acc[p.id] = p.slug; return acc; }, {} as Record<number, string>);

export default function ProblemsPage() {
  const [search, setSearch] = useState('');
  const solved = PROBLEMS.filter((p) => p.st === 'solved').length;
  const total = 4033;

  const filtered = useMemo(() => PROBLEMS.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [search]);

  const dashArr = (solved / total) * 50.3;

  return (
    <>
      <Navbar active="problems" />
      <div className="app-wrap">
        <Sidebar active="problems" />
        <div className="main">
          <div className="main-inner" style={{ maxWidth: 'none', padding: '12px 20px' }}>
            <div className="tags-row">
              {TAGS.map((t) => (
                <span key={t.n} className="tag-pill" onClick={() => toast(`${t.n} — demo`)}>
                  {t.n} <span className="tc">{t.c}</span>
                </span>
              ))}
              <span className="tag-pill" style={{ color: 'var(--blue)' }}>Expand ▾</span>
            </div>
            <div className="cat-tabs">
              {['All Topics', 'Algorithms', 'Database', 'Shell', 'Concurrency', 'JavaScript'].map((t, i) => (
                <span key={t} className={`cat-tab ${i === 0 ? 'act' : ''}`} onClick={() => toast(`${t} — demo`)}>{t}</span>
              ))}
            </div>
            <div className="ps-toolbar">
              <div className="ps-search">
                <Search />
                <input placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="ps-icons">
                <button className="ps-icon" title="Sort"><ArrowUpDown /></button>
                <button className="ps-icon" title="Filter"><Filter /></button>
              </div>
              <div className="ps-solved">
                <svg viewBox="0 0 20 20" width="16" height="16">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="var(--border)" strokeWidth="2" />
                  <circle cx="10" cy="10" r="8" fill="none" stroke="var(--solved)" strokeWidth="2"
                    strokeDasharray={`${dashArr.toFixed(1)} 50.3`} transform="rotate(-90 10 10)" />
                </svg>
                {solved}/{total} Solved
              </div>
              <button className="ps-icon" title="Random" onClick={() => toast('Random problem — demo')}><Shuffle /></button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th style={{ width: 48 }}>#</th>
                  <th>Title</th>
                  <th style={{ width: 90 }}>Acceptance</th>
                  <th style={{ width: 80 }}>Difficulty</th>
                  <th style={{ width: 70 }}>Frequency</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const dc = p.diff === 'Easy' ? 'e' : p.diff === 'Medium' ? 'm' : 'h';
                  const freq = ((p.id * 7919) % 100) / 100 * 0.8 + 0.1;
                  return (
                    <tr key={p.id}>
                      <td>{p.st === 'solved' ? <span className="solved-icon">✓</span> : p.st === 'attempted' ? <span className="attempted-icon">○</span> : ''}</td>
                      <td style={{ color: 'var(--tx-2)' }}>{p.id}.</td>
                      <td className="t-link">
                        <Link href={`/problem/${SLUG_BY_ID[p.id] ?? 'coming-soon'}`} style={{ color: 'inherit' }}>{p.title}</Link>
                      </td>
                      <td>{p.acc}%</td>
                      <td><span className={`diff diff-${dc}`}>{p.diff}</span></td>
                      <td><div className="freq-bar"><div className="freq-fill" style={{ width: `${(freq * 100).toFixed(0)}%` }} /></div></td>
                      <td style={{ color: 'var(--tx-3)', cursor: 'pointer' }} onClick={() => toast('Bookmarked — demo')}>☆</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="ps-pg">
              <button className="pg-b act">1</button>
              <button className="pg-b" onClick={() => toast('Page 2 — demo')}>2</button>
              <button className="pg-b" onClick={() => toast('Page 3 — demo')}>3</button>
              <span className="pg-b" style={{ pointerEvents: 'none' }}>…</span>
              <button className="pg-b" onClick={() => toast('Last page — demo')}>81</button>
            </div>
          </div>
        </div>
        <div className="right-sb">
          <Calendar />
          <div className="trending-card">
            <h5>
              Trending Companies
              <span style={{ display: 'flex', gap: 4 }}>
                <button style={{ color: 'var(--tx-2)' }} onClick={() => toast('Prev — demo')}>‹</button>
                <button style={{ color: 'var(--tx-2)' }} onClick={() => toast('Next — demo')}>›</button>
              </span>
            </h5>
            <input className="trending-search" placeholder="Search for a company..." onClick={() => toast('Company search — demo')} />
          </div>
        </div>
      </div>
    </>
  );
}
