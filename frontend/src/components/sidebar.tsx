'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PixelSwap from '@/components/reactbits/PixelSwap';

export default function Sidebar() {
  const pathname = usePathname();

  const IC = {
    library: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    compass: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    explore: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    cap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  };

  return (
    <div className="sidebar">
      <div style={{padding: '8px 12px', marginBottom: '12px'}}>
        <PixelSwap 
          firstContent={<div style={{fontWeight: 800, fontSize: '18px', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '8px'}}><span style={{color: 'var(--premium)'}}>&lt;/&gt;</span> AdaptCode</div>}
          secondContent={<div style={{fontWeight: 800, fontSize: '18px', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: '8px'}}><span style={{color: 'var(--blue)'}}>&lt;AI&gt;</span> TutorPro</div>}
          pixelSize={12}
          duration={1200}
          pixelDuration={300}
          style={{height: '30px', width: '100%'}}
        />
      </div>
      <Link className={`si ${pathname === '/dashboard' ? 'act' : ''}`} href="/dashboard">
        {IC.library} Library
      </Link>
      <Link className={`si ${pathname === '/history' ? 'act' : ''}`} href="/history">
        {IC.compass} History
      </Link>
      <a className="si" href="#" onClick={(e) => { e.preventDefault(); alert('Coming soon'); }}>
        {IC.explore} Explore
      </a>
      <a className="si" href="#" onClick={(e) => { e.preventDefault(); alert('Coming soon'); }}>
        {IC.cap} Study Plan
      </a>
      
      <div className="side-label">My Lists <button onClick={() => alert('Create list')}>+ ▾</button></div>
      <a className="side-sub" href="#" onClick={(e) => e.preventDefault()}><span className="ico">⭐</span> Favorite <span style={{marginLeft:'auto', fontSize:'11px', color:'var(--tx-3)'}}>🔒</span></a>
      <a className="side-sub" href="#" onClick={(e) => e.preventDefault()}><span className="ico">📋</span> array/string</a>
      
      <div className="side-label">Saved by me</div>
      <a className="side-sub" href="#" onClick={(e) => e.preventDefault()}><span className="ico">🎨</span> Design</a>
      <a className="side-sub" href="#" onClick={(e) => e.preventDefault()}><span className="ico">📊</span> Array</a>
    </div>
  );
}
