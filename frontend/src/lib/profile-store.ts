"use client";
import { useEffect, useState, useCallback } from 'react';

export type Profile = {
  name: string;
  display_name: string;
  avatar_data_uri: string | null;    // base64 data URI, null = initials fallback
  bio: string;
  socials: {
    github?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
};

export type LearningPrefs = {
  daily_goal: number;                       // problems/day target
  hint_mode: 'strict' | 'standard' | 'eager';
  default_difficulty: 'adaptive' | 'Easy' | 'Medium' | 'Hard';
  show_explanations: 'on_wrong' | 'always' | 'never';
  theme: 'dark' | 'light';
  reduced_motion: boolean;
};

const DEFAULT_PROFILE: Profile = {
  name: 'Justin Varghese',
  display_name: 'Justinvcj',
  avatar_data_uri: null,
  bio: 'Learning twelve concepts, one node at a time.',
  socials: { github: 'Justinvcj' },
};

const DEFAULT_PREFS: LearningPrefs = {
  daily_goal: 3,
  hint_mode: 'standard',
  default_difficulty: 'adaptive',
  show_explanations: 'on_wrong',
  theme: 'dark',
  reduced_motion: false,
};

const PROFILE_KEY = 'adaptcode.profile.v1';
const PREFS_KEY   = 'adaptcode.prefs.v1';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

/**
 * useProfile — client-side profile store backed by localStorage.
 * Returns the profile and a setter that persists. Server-render safe
 * (returns defaults until hydrated, then syncs).
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(safeGet(PROFILE_KEY, DEFAULT_PROFILE));
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch, socials: { ...prev.socials, ...(patch.socials || {}) } };
      safeSet(PROFILE_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    safeSet(PROFILE_KEY, DEFAULT_PROFILE);
    setProfile(DEFAULT_PROFILE);
  }, []);

  return { profile, update, reset, hydrated };
}

export function usePrefs() {
  const [prefs, setPrefs] = useState<LearningPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(safeGet(PREFS_KEY, DEFAULT_PREFS));
    setHydrated(true);
  }, []);

  const update = useCallback((patch: Partial<LearningPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      safeSet(PREFS_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    safeSet(PREFS_KEY, DEFAULT_PREFS);
    setPrefs(DEFAULT_PREFS);
  }, []);

  return { prefs, update, reset, hydrated };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U';
}

/**
 * Read an image File and return a resized, compressed data URI
 * (max 256×256 to keep localStorage usage reasonable).
 */
export async function fileToAvatarDataUri(file: File): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const i = new Image();
    i.onload = () => { URL.revokeObjectURL(url); resolve(i); };
    i.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    i.src = url;
  });

  const MAX = 256;
  const scale = Math.min(1, MAX / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', 0.82);
}
