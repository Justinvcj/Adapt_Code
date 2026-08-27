'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

import Counter from '@/components/reactbits/Counter';
import GlareHover from '@/components/reactbits/GlareHover';
import PixelCard from '@/components/reactbits/PixelCard';
import StarBorder from '@/components/reactbits/StarBorder';

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
    shuffle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
    flame: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
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
        <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
          <PixelCard variant="blue" className="rounded-[16px] overflow-hidden" style={{height: '140px', width: '100%', maxWidth: '350px'}}>
            <div style={{position: 'absolute', inset: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <h3 style={{fontSize: '14px', fontWeight: 600, color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>{IC.flame} Problem of the Day</h3>
              <p style={{fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px'}}>Two Sum IV - Input is a BST</p>
              <Link href="/practice" style={{fontSize: '14px', color: '#e0f2fe', textDecoration: 'underline'}}>Solve Now →</Link>
            </div>
          </PixelCard>
          
          <PixelCard variant="yellow" className="rounded-[16px] overflow-hidden" style={{height: '140px', width: '100%', maxWidth: '350px'}}>
            <div style={{position: 'absolute', inset: 0, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
               <h3 style={{fontSize: '14px', fontWeight: 600, color: '#fde047', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>Study Plan</h3>
               <p style={{fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px'}}>Top Interview 150</p>
               <Link href="#" style={{fontSize: '14px', color: '#fef08a', textDecoration: 'underline'}}>Continue Practice →</Link>
            </div>
          </PixelCard>
        </div>
        
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
          <div className="ps-solved" style={{display: 'flex', alignItems: 'center'}}>
            <svg viewBox="0 0 20 20" width="16" height="16" style={{marginRight: '6px'}}>
              <circle cx="10" cy="10" r="8" fill="none" stroke="var(--border)" strokeWidth="2"/>
              <circle cx="10" cy="10" r="8" fill="none" stroke="var(--solved)" strokeWidth="2" strokeDasharray={`${(solved/total*50.3).toFixed(1)} 50.3`} transform="rotate(-90 10 10)"/>
            </svg> 
            <Counter 
               value={solved}
               fontSize={13}
               fontWeight={600}
               textColor="var(--tx)"
               gap={0}
            /> 
            <span style={{marginLeft: '4px'}}> / {total} Solved</span>
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
        <GlareHover width="100%" height="auto" borderRadius="12px" glareColor="#ffffff" glareOpacity={0.1}>
          <div className="weekly-card" style={{width: '100%', margin: 0, border: 'none', background: 'transparent', boxShadow: 'inset 0 0 0 1px rgba(255,161,22,0.3)'}}>
            <div className="weekly-head">
              <h5 style={{color: 'var(--premium)'}}>Weekly Premium ⓘ</h5>
              <span>2 days left</span>
            </div>
            <div className="weekly-boxes">
              {['W1','W2','W3','W4','W5'].map((w, i) => (
                <div key={w} className={`weekly-box ${i === 3 ? 'act' : ''}`} style={i === 3 ? {background: 'rgba(255,161,22,0.2)', color: 'var(--premium)', borderColor: 'var(--premium)'} : {}}>{w}</div>
              ))}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
              <span style={{color: 'var(--solved)'}}>● 0 Redeem</span>
              <a href="#" style={{color: 'var(--tx-2)'}}>Rules</a>
            </div>
          </div>
        </GlareHover>
        
        <div style={{marginTop: '16px', display: 'flex', justifyContent: 'center'}}>
          <StarBorder as="button" color="#ffa116" speed="4s" thickness={2} style={{width: '100%'}}>
             <span style={{fontWeight: 700, color: 'white'}}>Upgrade to Premium</span>
          </StarBorder>
        </div>
      </div>
      
    </div>
  );
}
