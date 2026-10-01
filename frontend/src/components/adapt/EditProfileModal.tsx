"use client";
import { useEffect, useState } from 'react';
import { X, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { GithubIcon, TwitterIcon, LinkedinIcon } from './icons';
import { useProfile, type Profile } from '@/lib/profile-store';

type Props = { open: boolean; onClose: () => void };

export default function EditProfileModal({ open, onClose }: Props) {
  const { profile, update, reset } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);

  useEffect(() => { if (open) setDraft(profile); }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const save = () => {
    if (!draft.name.trim()) { toast.error('Name is required.'); return; }
    update(draft);
    toast.success('Profile saved');
    onClose();
  };

  const social = (k: keyof Profile['socials'], v: string) =>
    setDraft((d) => ({ ...d, socials: { ...d.socials, [k]: v } }));

  return (
    <div className="epm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="epm-modal">
        <header className="epm-head">
          <h3>Edit profile</h3>
          <button className="epm-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>

        <div className="epm-body">
          <div className="epm-avatar-row">
            <Avatar
              name={draft.name}
              dataUri={draft.avatar_data_uri}
              editable
              size={96}
              onChange={(uri) => setDraft((d) => ({ ...d, avatar_data_uri: uri }))}
            />
            <div className="epm-avatar-meta">
              <p>Click the avatar to upload a new image.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {draft.avatar_data_uri && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setDraft((d) => ({ ...d, avatar_data_uri: null }))}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="epm-grid">
            <label className="epm-field">
              <span>Display name</span>
              <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            </label>

            <label className="epm-field">
              <span>Handle</span>
              <input
                value={draft.display_name}
                onChange={(e) => setDraft((d) => ({ ...d, display_name: e.target.value.replace(/[^A-Za-z0-9._-]/g, '') }))}
              />
            </label>
          </div>

          <label className="epm-field">
            <span>Bio</span>
            <textarea
              rows={3}
              maxLength={160}
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              placeholder="One line about what you're learning right now."
            />
            <div className="epm-counter">{draft.bio.length}/160</div>
          </label>

          <div className="epm-section-h">Social links</div>
          <div className="epm-grid">
            <label className="epm-field">
              <span><GithubIcon size={13} /> GitHub</span>
              <input value={draft.socials.github ?? ''} onChange={(e) => social('github', e.target.value)} placeholder="username" />
            </label>
            <label className="epm-field">
              <span><LinkedinIcon size={13} /> LinkedIn</span>
              <input value={draft.socials.linkedin ?? ''} onChange={(e) => social('linkedin', e.target.value)} placeholder="username" />
            </label>
            <label className="epm-field">
              <span><TwitterIcon size={13} /> X / Twitter</span>
              <input value={draft.socials.twitter ?? ''} onChange={(e) => social('twitter', e.target.value)} placeholder="username" />
            </label>
            <label className="epm-field">
              <span><Globe size={13} /> Website</span>
              <input
                type="url"
                value={draft.socials.website ?? ''}
                onChange={(e) => social('website', e.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>
        </div>

        <footer className="epm-foot">
          <button
            className="btn btn-ghost"
            onClick={() => { if (confirm('Reset profile to defaults?')) { reset(); onClose(); } }}
          >
            Reset to defaults
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
