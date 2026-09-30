"use client";
import { useState } from 'react';
import { User, Mail, Phone, Key, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/adapt/Navbar';
import Sidebar from '@/components/adapt/Sidebar';
import { USER } from '@/components/adapt/data';

const TABS: [string, string][] = [
  ['account', 'Account'], ['privacy', 'Privacy'], ['points', 'Points'],
  ['orders', 'Orders'], ['notif', 'Notifications'], ['profile', 'Profile Settings'],
];

export default function SettingsPage() {
  const [tab, setTab] = useState('account');
  const label = TABS.find((t) => t[0] === tab)?.[1] || 'Settings';

  return (
    <>
      <Navbar active="settings" />
      <div className="app-wrap">
        <Sidebar active="settings" />
        <div className="set-wrap">
          <div className="set-nav">
            <h2>Settings</h2>
            {TABS.map(([k, l]) => (
              <a key={k} className={`set-link ${tab === k ? 'act' : ''}`} onClick={() => setTab(k)}>
                {l}{k === 'profile' ? ' ↗' : ''}
              </a>
            ))}
          </div>
          <div className="set-body">
            {tab === 'account' ? (
              <>
                <h3>General</h3>
                <p className="set-sub">You can log in using your email, phone number, or AdaptCode ID.</p>
                <div className="set-row"><div className="set-row-icon"><User /></div><div><div className="set-row-label">AdaptCode ID</div></div><div className="set-row-val">{USER.user}</div><div className="set-row-arrow">›</div></div>
                <div className="set-row"><div className="set-row-icon"><Mail /></div><div><div className="set-row-label">Email</div></div><div className="set-row-val">23c****@drngpit.ac.in</div><div className="set-row-arrow">›</div></div>
                <div className="set-row"><div className="set-row-icon"><Phone /></div><div><div className="set-row-label">Phone Number</div></div><div className="set-row-val"></div><div className="set-row-arrow">›</div></div>
                <div className="set-row"><div className="set-row-icon"><Key /></div><div><div className="set-row-label">Password</div></div><div className="set-row-val">••••••••</div><div className="set-row-arrow">›</div></div>
                <div className="set-section">
                  <h4>Social Accounts</h4>
                  <p className="set-sub">Connect a social account to sign in to AdaptCode.</p>
                  <div className="social-row">
                    <div className="social-row-icon">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <div className="social-row-name">Google</div>
                    <button className="btn-disconnect" onClick={() => toast('Disconnect — demo')}>Disconnect</button>
                  </div>
                  <div className="social-row">
                    <div className="social-row-icon"><Github /></div>
                    <div className="social-row-name">Github</div>
                    <button className="btn-disconnect" onClick={() => toast('Disconnect — demo')}>Disconnect</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3>{label}</h3>
                <p className="set-sub">This section is available in the full version.</p>
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--tx-3)' }}>Settings content — demo only</div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
