'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { useToastContext } from '@/components/toast-provider';
import { USER } from '@/lib/data';
import { MailIcon, PhoneIcon, KeyIcon, GithubIcon, GoogleIcon, ExternalIcon } from '@/components/icons';

const TABS = ['Account', 'Privacy', 'Notifications', 'Profile'] as const;
type Tab = typeof TABS[number];

export default function SettingsPage() {
  const { toast } = useToastContext();
  const [tab, setTab] = useState<Tab>('Account');

  return (
    <AppLayout>
      <div className="max-w-[800px] mx-auto px-5 py-6">
        <h1 className="text-xl font-bold tracking-[-0.02em] mb-5">Settings</h1>

        {/* Tab nav */}
        <div className="flex gap-0.5 border-b border-[var(--border)] mb-6">
          {TABS.map((t) => (
            <button key={t} className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-all relative ${tab === t ? 'text-[var(--tx)]' : 'text-[var(--tx-2)] hover:text-[var(--tx-1)]'}`} onClick={() => setTab(t)}>
              {t}
              {tab === t && <span className="absolute bottom-[-1px] left-4 right-4 h-0.5 bg-[var(--tx)] rounded-t-sm" />}
            </button>
          ))}
        </div>

        {tab === 'Account' && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--accent)] flex items-center justify-center text-2xl font-bold text-white">{USER.name.charAt(0)}</div>
              <div>
                <button className="px-3 py-1.5 rounded-[var(--r)] text-[13px] font-medium bg-[var(--bg-el)] border border-[var(--border)] hover:border-[var(--border-h)] transition-colors" onClick={() => toast('Upload avatar — demo', 'info')}>Change Avatar</button>
                <p className="text-xs text-[var(--tx-3)] mt-1">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            {/* Form */}
            <Section title="Personal Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Display Name" value={USER.name} icon={<span className="text-[var(--tx-3)]">👤</span>} />
                <Field label="Username" value={USER.user} icon={<span className="text-[var(--tx-3)]">@</span>} />
                <Field label="Email" value="user@adaptcode.io" icon={<MailIcon size={14} />} />
                <Field label="Phone" value="+1 (555) 000-0000" icon={<PhoneIcon size={14} />} />
              </div>
            </Section>

            <Section title="Password">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Current Password" value="••••••••" type="password" icon={<KeyIcon size={14} />} />
                <Field label="New Password" value="" placeholder="Enter new password" type="password" icon={<KeyIcon size={14} />} />
              </div>
              <button className="mt-3 px-4 py-2 rounded-[var(--r)] text-[13px] font-medium bg-[var(--blue)] text-white hover:bg-[var(--blue-h)] transition-colors" onClick={() => toast('Password updated — demo', 'success')}>Update Password</button>
            </Section>

            <Section title="Connected Accounts">
              <div className="space-y-2">
                {[
                  { name: 'Google', icon: <GoogleIcon size={18} />, connected: true },
                  { name: 'GitHub', icon: <GithubIcon size={18} />, connected: true },
                  { name: 'LinkedIn', icon: <ExternalIcon size={18} />, connected: false },
                ].map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-3 rounded-[var(--r-md)] border border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--tx-1)]">{a.icon}</span>
                      <div>
                        <div className="text-[13px] font-medium">{a.name}</div>
                        <div className="text-xs text-[var(--tx-2)]">{a.connected ? 'Connected' : 'Not connected'}</div>
                      </div>
                    </div>
                    <button className={`px-3 py-1.5 rounded-[var(--r)] text-xs font-medium border transition-colors ${a.connected ? 'border-[var(--border)] text-[var(--tx-2)] hover:text-[var(--hard)] hover:border-[var(--hard)]' : 'border-[var(--blue)] text-[var(--blue)] hover:bg-[rgba(94,106,210,0.1)]'}`} onClick={() => toast(`${a.name} — demo`, 'info')}>
                      {a.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Danger Zone">
              <div className="p-3 rounded-[var(--r-md)] border border-[var(--hard)] bg-[rgba(255,55,95,0.05)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--hard)]">Delete Account</div>
                    <div className="text-xs text-[var(--tx-2)]">Permanently delete your account and all data.</div>
                  </div>
                  <button className="px-3 py-1.5 rounded-[var(--r)] text-xs font-medium bg-[var(--hard)] text-white hover:bg-[#ff1a44] transition-colors" onClick={() => toast('Account deletion — demo', 'info')}>Delete Account</button>
                </div>
              </div>
            </Section>
          </div>
        )}

        {tab === 'Privacy' && (
          <div className="space-y-6">
            <Section title="Privacy Settings">
              {[
                { l: 'Show my profile publicly', d: 'Allow others to view your profile and stats', v: true },
                { l: 'Show submission history', d: 'Display your recent submissions on your profile', v: true },
                { l: 'Show activity heatmap', d: 'Display your coding activity calendar', v: true },
                { l: 'Allow contest participation visibility', d: 'Show your contest rankings publicly', v: false },
              ].map((s) => (
                <Toggle key={s.l} label={s.l} description={s.d} defaultChecked={s.v} />
              ))}
            </Section>
          </div>
        )}

        {tab === 'Notifications' && (
          <div className="space-y-6">
            <Section title="Email Notifications">
              {[
                { l: 'Contest reminders', d: 'Get notified before contests start', v: true },
                { l: 'Daily challenge', d: 'Receive the daily problem via email', v: false },
                { l: 'Solution replies', d: 'When someone replies to your solution', v: true },
                { l: 'Weekly progress report', d: 'Summary of your weekly activity', v: true },
              ].map((s) => (
                <Toggle key={s.l} label={s.l} description={s.d} defaultChecked={s.v} />
              ))}
            </Section>
            <Section title="Push Notifications">
              {[
                { l: 'Contest starting soon', d: 'Notify 15 min before contest', v: true },
                { l: 'Streak reminder', d: 'Remind to maintain your streak', v: true },
              ].map((s) => (
                <Toggle key={s.l} label={s.l} description={s.d} defaultChecked={s.v} />
              ))}
            </Section>
          </div>
        )}

        {tab === 'Profile' && (
          <div className="space-y-6">
            <Section title="Profile Details">
              <div className="space-y-4">
                <Field label="Bio" value="Competitive programmer | Java & Python enthusiast" />
                <Field label="Location" value="San Francisco, CA" />
                <Field label="Company" value="AdaptCode Inc." />
                <Field label="Website" value="https://adaptcode.io" />
              </div>
              <button className="mt-4 px-4 py-2 rounded-[var(--r)] text-[13px] font-medium bg-[var(--blue)] text-white hover:bg-[var(--blue-h)] transition-colors" onClick={() => toast('Profile saved — demo', 'success')}>Save Changes</button>
            </Section>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, placeholder, type = 'text', icon }: { label: string; value: string; placeholder?: string; type?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[13px] font-medium text-[var(--tx-1)]">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--tx-3)]">{icon}</span>}
        <input type={type} defaultValue={value} placeholder={placeholder} className={`w-full px-3 py-[9px] rounded-[var(--r)] border border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm focus:border-[var(--blue)] transition-colors ${icon ? 'pl-8' : ''}`} />
      </div>
    </div>
  );
}

function Toggle({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)]">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        <div className="text-xs text-[var(--tx-2)]">{description}</div>
      </div>
      <button className={`relative w-10 h-[22px] rounded-full transition-colors ${on ? 'bg-[var(--blue)]' : 'bg-[var(--bg-sf3)]'}`} onClick={() => setOn(!on)}>
        <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-transform ${on ? 'left-[22px]' : 'left-[3px]'}`} />
      </button>
    </div>
  );
}
