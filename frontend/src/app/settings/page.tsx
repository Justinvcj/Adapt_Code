"use client";
import { useState } from 'react';
import {
  User, Mail, Phone, Key, GraduationCap, Palette, Target,
  Lightbulb, Gauge, EyeOff, Eye, Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import { GithubIcon } from '@/components/adapt/icons';
import { USER } from '@/components/adapt/data';
import { usePrefs } from '@/lib/profile-store';

type TabKey = 'account' | 'learning' | 'appearance' | 'notif' | 'privacy';

const TABS: { k: TabKey; label: string; icon: typeof User }[] = [
  { k: 'account',    label: 'Account',             icon: User          },
  { k: 'learning',   label: 'Learning',            icon: GraduationCap },
  { k: 'appearance', label: 'Appearance',          icon: Palette       },
  { k: 'notif',      label: 'Notifications',       icon: Bell          },
  { k: 'privacy',    label: 'Privacy',             icon: EyeOff        },
];

/** Tiny visual swatch for each theme card. */
function ThemePreview({ theme }: { theme: 'dark' | 'light' | 'violet' }) {
  const palettes = {
    dark:   { bg: '#010102', card: '#141516', ring: '#ffa116', dot: '#27a644' },
    light:  { bg: '#fafaf7', card: '#ffffff', ring: '#d47300', dot: '#1f8f3a' },
    violet: { bg: '#000000', card: '#13131f', ring: '#8b7cff', dot: '#34d399' },
  };
  const p = palettes[theme];
  const stroke = theme === 'light' ? '#e4e2db' : 'rgba(255,255,255,.08)';
  return (
    <div className="theme-preview" style={{ background: p.bg, borderColor: stroke }}>
      <div className="theme-preview-nav" style={{ borderColor: stroke }}>
        <span style={{ background: p.ring }} />
        <i style={{ background: stroke }} />
        <i style={{ background: stroke }} />
      </div>
      <div className="theme-preview-row">
        <svg viewBox="0 0 36 36" width="28" height="28">
          <circle cx="18" cy="18" r="14" fill="none" stroke={stroke} strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={p.ring} strokeWidth="3" strokeDasharray="60 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <i style={{ height: 5, borderRadius: 2, background: stroke, width: '70%' }} />
          <i style={{ height: 4, borderRadius: 2, background: stroke, width: '45%', opacity: 0.6 }} />
        </div>
        <span className="theme-preview-dot" style={{ background: p.dot }} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>('account');
  const { prefs, update, reset } = usePrefs();

  return (
    <>
      <Navbar active="settings" />
      <div className="land">
        <div className="set-wrap">
          <nav className="set-nav">
            <h2>Settings</h2>
            {TABS.map(({ k, label, icon: Ic }) => (
              <a key={k} className={`set-link ${tab === k ? 'act' : ''}`} onClick={() => setTab(k)}>
                <Ic size={14} style={{ marginRight: 8, verticalAlign: -2 }} />
                {label}
              </a>
            ))}
          </nav>
          <div className="set-body">
            {tab === 'account' && (
              <>
                <h3>Account</h3>
                <p className="set-sub">You can log in using your email, phone number, or AdaptCode ID.</p>
                <div className="set-row"><div className="set-row-icon"><User /></div><div><div className="set-row-label">AdaptCode ID</div></div><div className="set-row-val">{USER.user}</div><div className="set-row-arrow">›</div></div>
                <div className="set-row"><div className="set-row-icon"><Mail /></div><div><div className="set-row-label">Email</div></div><div className="set-row-val">23c****@drngpit.ac.in</div><div className="set-row-arrow">›</div></div>
                <div className="set-row"><div className="set-row-icon"><Phone /></div><div><div className="set-row-label">Phone</div></div><div className="set-row-val">—</div><div className="set-row-arrow">›</div></div>
                <div className="set-row"><div className="set-row-icon"><Key /></div><div><div className="set-row-label">Password</div></div><div className="set-row-val">••••••••</div><div className="set-row-arrow">›</div></div>
                <div className="set-section">
                  <h4>Social accounts</h4>
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
                    <div className="social-row-icon"><GithubIcon size={18} /></div>
                    <div className="social-row-name">GitHub</div>
                    <button className="btn-disconnect" onClick={() => toast('Disconnect — demo')}>Disconnect</button>
                  </div>
                </div>
              </>
            )}

            {tab === 'learning' && (
              <>
                <h3>Learning</h3>
                <p className="set-sub">How AdaptCode adapts to you.</p>

                <div className="pref-group">
                  <div className="pref-label">
                    <Target size={14} /> Daily goal
                    <span className="pref-help">How many problems per day you&apos;re aiming for.</span>
                  </div>
                  <div className="pref-chips">
                    {[1, 3, 5, 10].map((n) => (
                      <button
                        key={n}
                        className={`pref-chip ${prefs.daily_goal === n ? 'act' : ''}`}
                        onClick={() => update({ daily_goal: n })}
                      >
                        {n} / day
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pref-group">
                  <div className="pref-label">
                    <Lightbulb size={14} /> Hint policy
                    <span className="pref-help">When hints become available and how eagerly the UI surfaces them.</span>
                  </div>
                  <div className="pref-chips">
                    {([
                      ['strict',   'Strict',   'Only after you cross the thresholds'],
                      ['standard', 'Standard', 'The default thresholds (recommended)'],
                      ['eager',    'Eager',    'Surface hints sooner for easier practice'],
                    ] as const).map(([v, label, desc]) => (
                      <button
                        key={v}
                        className={`pref-chip pref-chip-wide ${prefs.hint_mode === v ? 'act' : ''}`}
                        onClick={() => update({ hint_mode: v })}
                      >
                        <b>{label}</b><span>{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pref-group">
                  <div className="pref-label">
                    <Gauge size={14} /> Default difficulty
                    <span className="pref-help">Where the adaptive engine starts you for a new concept.</span>
                  </div>
                  <div className="pref-chips">
                    {(['adaptive', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                      <button
                        key={d}
                        className={`pref-chip ${prefs.default_difficulty === d ? 'act' : ''}`}
                        onClick={() => update({ default_difficulty: d })}
                      >
                        {d === 'adaptive' ? 'Let AdaptCode choose' : d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pref-group">
                  <div className="pref-label">
                    <Eye size={14} /> Explanations
                    <span className="pref-help">When to generate an AI explanation of your submission.</span>
                  </div>
                  <div className="pref-chips">
                    {([
                      ['on_wrong', 'On wrong answers'],
                      ['always',   'Every submission'],
                      ['never',    'Never'],
                    ] as const).map(([v, label]) => (
                      <button
                        key={v}
                        className={`pref-chip ${prefs.show_explanations === v ? 'act' : ''}`}
                        onClick={() => update({ show_explanations: v })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pref-foot">
                  <button className="btn btn-ghost" onClick={() => { reset(); toast('Learning preferences reset'); }}>
                    Reset to defaults
                  </button>
                  <span className="pref-saved">Changes save automatically</span>
                </div>
              </>
            )}

            {tab === 'appearance' && (
              <>
                <h3>Appearance</h3>
                <p className="set-sub">Three themes. Pick the one that lets you focus.</p>

                <div className="pref-group">
                  <div className="pref-label">
                    <Palette size={14} /> Theme
                    <span className="pref-help">Applies instantly, remembered across sessions.</span>
                  </div>
                  <div className="theme-cards">
                    {([
                      { k: 'dark',   label: 'Dark',   sub: 'Near-black + warm amber' },
                      { k: 'light',  label: 'Light',  sub: 'Paper white + muted copper' },
                      { k: 'violet', label: 'Violet', sub: 'Pure black + indigo accent' },
                    ] as const).map(({ k, label, sub }) => (
                      <button
                        key={k}
                        className={`theme-card ${prefs.theme === k ? 'act' : ''}`}
                        onClick={() => update({ theme: k })}
                        aria-pressed={prefs.theme === k}
                      >
                        <ThemePreview theme={k} />
                        <div className="theme-card-meta">
                          <b>{label}</b>
                          <span>{sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pref-group">
                  <label className="pref-toggle">
                    <input
                      type="checkbox"
                      checked={prefs.reduced_motion}
                      onChange={(e) => update({ reduced_motion: e.target.checked })}
                    />
                    <span>
                      <b>Reduce motion</b>
                      <small>Dim transitions and disable the pulse animations.</small>
                    </span>
                  </label>
                </div>
              </>
            )}

            {tab === 'notif' && (
              <>
                <h3>Notifications</h3>
                <p className="set-sub">Choose what you hear from AdaptCode.</p>
                <div className="pref-group">
                  <label className="pref-toggle"><input type="checkbox" defaultChecked /> <span><b>Daily streak reminder</b><small>Pings you if you haven&apos;t solved anything by evening.</small></span></label>
                  <label className="pref-toggle"><input type="checkbox" defaultChecked /> <span><b>Weekly summary</b><small>Mastery deltas, longest streak, top concept each week.</small></span></label>
                  <label className="pref-toggle"><input type="checkbox" /> <span><b>Contest reminders</b><small>Day-of ping for contests you joined.</small></span></label>
                </div>
              </>
            )}

            {tab === 'privacy' && (
              <>
                <h3>Privacy</h3>
                <p className="set-sub">Who can see what you do on AdaptCode.</p>
                <div className="pref-group">
                  <label className="pref-toggle"><input type="checkbox" defaultChecked /> <span><b>Public profile</b><small>Your handle and solved count appear on the leaderboard.</small></span></label>
                  <label className="pref-toggle"><input type="checkbox" /> <span><b>Public submissions</b><small>Others can see your code on accepted problems.</small></span></label>
                  <label className="pref-toggle"><input type="checkbox" defaultChecked /> <span><b>Help improve AdaptCode</b><small>Share anonymised attempt patterns to tune the engine.</small></span></label>
                </div>
                <div className="pref-foot" style={{ marginTop: 16 }}>
                  <button className="btn btn-ghost" style={{ color: 'var(--hard)' }} onClick={() => toast('Export — coming soon')}>Export my data</button>
                  <button className="btn btn-ghost" style={{ color: 'var(--hard)' }} onClick={() => toast('Account deletion — coming soon')}>Delete account</button>
                </div>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
