"use client";
import { useEffect } from 'react';
import { usePrefs } from '@/lib/profile-store';

/**
 * Sets `data-theme` on <html> based on the user's stored preference.
 * Runs once on mount and again whenever the stored theme changes.
 */
export default function ThemeApplier() {
  const { prefs, hydrated } = usePrefs();

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', prefs.theme);
    if (prefs.reduced_motion) root.setAttribute('data-reduced-motion', '1');
    else root.removeAttribute('data-reduced-motion');
  }, [prefs.theme, prefs.reduced_motion, hydrated]);

  return null;
}
