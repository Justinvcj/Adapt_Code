"use client";
import { Library, Compass, Search, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sidebar({ active }: { active?: string }) {
  const soon = (m: string) => toast(m);
  return (
    <div className="sidebar">
      <button className={`si ${active === 'library' ? 'act' : ''}`} onClick={() => soon('Library coming soon')}><Library /> Library</button>
      <button className="si" onClick={() => soon('Quest coming soon')}><Compass /> Quest</button>
      <button className={`si ${active === 'explore' ? 'act' : ''}`} onClick={() => soon('Explore coming soon')}><Search /> Explore</button>
      <button className="si" onClick={() => soon('Study Plan coming soon')}><GraduationCap /> Study Plan</button>
      <div className="side-label">My Lists <button onClick={() => soon('Create list — demo')}>+ ▾</button></div>
      <button className="side-sub"><span className="ico">⭐</span> Favorite</button>
      <button className="side-sub"><span className="ico">📋</span> array/string</button>
      <button className="side-sub"><span className="ico">📋</span> 001</button>
      <button className="side-sub"><span className="ico">📋</span> PET 1</button>
      <div className="side-label">Saved by me</div>
      <button className="side-sub"><span className="ico">🎨</span> Design</button>
      <button className="side-sub"><span className="ico">📊</span> Array</button>
    </div>
  );
}
