'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApi('/api/problems')
      .then(res => setProblems(res.data || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const IC = {
    search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    sort: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/></svg>,
    filter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    shuffle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
  };

  const filteredProblems = problems.filter(p => {
    if (filter !== 'all' && p.difficulty_level.toLowerCase() !== filter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const solved = problems.filter(p => p.is_solved).length;
  const total = problems.length || 1; // avoid / 0

  return (
    <div className="main-inner" style={{maxWidth: 'none', padding: '12px 20px', display: 'flex', gap: '20px'}}>
      
      <div style={{flex: 1}}>
        <div className="tags-row">
          <span className="tag-pill">Array <span className="tc">2238</span></span>
          <span className="tag-pill">String <span className="tc">893</span></span>
          <span className="tag-pill">Hash Table <span className="tc">832</span></span>
          <span className="tag-pill">Math <span className="tc">702</span></span>
          <span className="tag-pill" style={{color: 'var(--blue)'}}>Expand ▾</span>
        </div>
        
        <div className="cat-tabs">
          <span className="cat-tab act">All Topics</span>
          <span className="cat-tab">Algorithms</span>
          <span className="cat-tab">Database</span>
        </div>
        
        <div className="ps-toolbar">
          <div className="ps-search">
            {IC.search}
            <input 
              type="text" 
              placeholder="Search questions" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="ps-icons">
            <button className="ps-icon" title="Sort">{IC.sort}</button>
            <button className="ps-icon" title="Filter">{IC.filter}</button>
          </div>
          <div className="ps-solved">
            <svg viewBox="0 0 20 20" width="16" height="16">
              <circle cx="10" cy="10" r="8" fill="none" stroke="var(--border)" strokeWidth="2"/>
              <circle cx="10" cy="10" r="8" fill="none" stroke="var(--solved)" strokeWidth="2" strokeDasharray={`${(solved/total*50.3).toFixed(1)} 50.3`} transform="rotate(-90 10 10)"/>
            </svg> 
            {solved}/{total} Solved
          </div>
          <button className="ps-icon" title="Random">{IC.shuffle}</button>
        </div>

        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--tx-2)'}}>Loading problems...</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{width: '36px'}}></th>
                <th style={{width: '48px'}}>#</th>
                <th>Title</th>
                <th style={{width: '90px'}}>Acceptance</th>
                <th style={{width: '80px'}}>Difficulty</th>
                <th style={{width: '70px'}}>Frequency</th>
                <th style={{width: '36px'}}></th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((p, i) => {
                const dc = p.difficulty_level === 'easy' ? 'e' : p.difficulty_level === 'medium' ? 'm' : 'h';
                const freq = Math.random() * 0.8 + 0.1;
                return (
                  <tr key={p.problem_id}>
                    <td>
                      {p.is_solved ? <span className="solved-icon">✓</span> : p.is_attempted ? <span className="attempted-icon">○</span> : ''}
                    </td>
                    <td style={{color: 'var(--tx-2)'}}>{p.problem_id}.</td>
                    <td className="t-link">
                      <Link href={`/practice?problem_id=${p.problem_id}`}>{p.title}</Link>
                    </td>
                    <td>{Math.floor(Math.random() * 40 + 30)}%</td>
                    <td><span className={`diff diff-${dc}`}>{p.difficulty_level.charAt(0).toUpperCase() + p.difficulty_level.slice(1)}</span></td>
                    <td>
                      <div className="freq-bar">
                        <div className="freq-fill" style={{width: `${(freq * 100).toFixed(0)}%`}}></div>
                      </div>
                    </td>
                    <td style={{color: 'var(--tx-3)', cursor: 'pointer'}}>☆</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="right-sb">
        <div className="weekly-card">
          <div className="weekly-head">
            <h5>Weekly Premium ⓘ</h5>
            <span>2 days left</span>
          </div>
          <div className="weekly-boxes">
            {['W1','W2','W3','W4','W5'].map((w, i) => (
              <div key={w} className={`weekly-box ${i === 3 ? 'act' : ''}`}>{w}</div>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
            <span style={{color: 'var(--solved)'}}>● 0 Redeem</span>
            <a href="#" style={{color: 'var(--tx-2)'}}>Rules</a>
          </div>
        </div>
      </div>
      
    </div>
  );
}
