"use client";
import Link from 'next/link';
import { Trophy, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/adapt/Navbar';
import Sidebar from '@/components/adapt/Sidebar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="app-wrap">
        <Sidebar active="library" />
        <div className="main">
          <div className="main-inner">
            <div className="contest-item">
              <div className="contest-badge">🏆</div>
              <div className="contest-info">
                <div className="ctime">in 4 days</div>
                <div className="ctitle">Join our next Contest{' '}
                  <a className="feed-link" onClick={() => toast('Contest — demo')}>Biweekly Contest 190</a>
                </div>
              </div>
            </div>
            <div className="contest-item">
              <div className="contest-badge">🏆</div>
              <div className="contest-info">
                <div className="ctime">in 4 days</div>
                <div className="ctitle">Join our next Contest{' '}
                  <a className="feed-link" onClick={() => toast('Contest — demo')}>Weekly Contest 517</a>
                </div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-head">
                <div className="feed-icon" style={{ background: 'var(--easy-bg)' }}>🔄</div>
                <div>
                  <div className="feed-time">9 days ago</div>
                  <div className="feed-title">AdaptCode posted 📌 <a className="feed-link">Back to School 2026 — Become our Campus Ambassador!</a></div>
                  <div className="feed-body">Hi AdaptCoders! 👋 Starting August 24, 2026, for a limited time, get together with your classmates and become an AdaptCode Campus Ambassador. Represent your college, host events, and...</div>
                </div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-head">
                <div className="feed-icon" style={{ background: 'rgba(94,106,210,.15)' }}>📱</div>
                <div>
                  <div className="feed-time">4 months ago</div>
                  <div className="feed-title">AdaptCode posted 📱 <a className="feed-link">AdaptCode at Your Fingertips</a></div>
                  <div className="feed-body">Introducing the AdaptCode mobile app, now available for smartphones and tablets. One problem a day keeps your reasoning in play. Jump in for quick practice, browse your collections, and...</div>
                </div>
              </div>
            </div>
            <div className="feed-item">
              <div className="feed-head">
                <div className="feed-icon" style={{ background: 'var(--hard-bg)' }}>👤</div>
                <div>
                  <div className="feed-time">an hour ago</div>
                  <div className="feed-title">oBo posted <span style={{ color: 'var(--hard)' }}>3 AM !!</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-sb">
          <div className="rsb-card">
            <h4><Trophy size={16} /> AdaptCode Contest</h4>
            <p>Participate and win prizes.</p>
            <button className="btn btn-outline btn-sm" onClick={() => toast('Contest — demo')}>Join Contest</button>
          </div>
          <div className="rsb-card">
            <h4><MessageCircle size={16} /> Discuss Now</h4>
            <p>Share interview questions.<br />Get solutions.</p>
          </div>
        </div>
      </div>
    </>
  );
}
