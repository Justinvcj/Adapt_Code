/**
 * Retired. The Practice page used to render its own left rail under the top
 * navbar; since the 2026-11 rebrand the whole app has one sidebar, rendered by
 * `Navbar.tsx`, so a second rail would duplicate it. Kept as a no-op so the
 * existing `<Sidebar />` call site keeps compiling; delete both together.
 */
export default function Sidebar(_props: { active?: string }) {
  return null;
}
