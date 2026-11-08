import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy · AdaptCode',
  description: 'Privacy Policy for the AdaptCode adaptive learning platform.',
};

/**
 * Placeholder Privacy Policy page — required by the Google OAuth provider
 * verification flow. Same caveat as /terms applies: have a lawyer review
 * this before shipping to real users.
 */
export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px', color: 'var(--tx)', lineHeight: 1.6 }}>
      <Link href="/" style={{ color: 'var(--tx-2)', fontSize: 13 }}>← Back</Link>
      <h1 style={{ fontSize: 28, marginTop: 24, marginBottom: 16 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--tx-2)', fontSize: 13, marginBottom: 32 }}>Last updated: 2026-11-08</p>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>What we collect</h2>
        <ul>
          <li>Account data: email, display name, OAuth provider ID when you use Google sign-in. Passwords (when used) are hashed by Supabase Auth and never seen by our backend.</li>
          <li>Learning data: submitted code, verdicts, per-concept mastery scores, time-on-task, hint usage. Needed for the adaptive engine.</li>
          <li>Technical data: request timestamps, IP address (for rate limiting), user-agent.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>How we use it</h2>
        <ul>
          <li>To run the service: grade your code, update your mastery, pick the next problem.</li>
          <li>To debug and prevent abuse: logs, rate-limit counters.</li>
          <li>To generate explanations on failed submissions: your failed code + verdict are sent to Google&apos;s Gemini API. No long-term storage on Google&apos;s side per their API policy.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>Third-party services</h2>
        <ul>
          <li><b>Supabase</b> (database + authentication)</li>
          <li><b>Google Gemini</b> (failure explanations only; prompt includes your code and verdict)</li>
          <li><b>Piston</b> on a private VPN (code execution sandbox)</li>
          <li><b>Vercel</b> (frontend hosting) and <b>Google Cloud Run</b> (backend hosting) — each sees standard request metadata</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>Your controls</h2>
        <ul>
          <li>Delete your account from settings to remove your learning data.</li>
          <li>Opt out of Gemini explanations by not requesting them (i.e. don&apos;t submit failing solutions). We do not train models on your data.</li>
          <li>Contact us (<a href="https://github.com/Justinvcj/Adapt_Code/issues">issues</a>) to request a copy of your data.</li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>No selling, no ads</h2>
        <p>We do not sell your data and we do not run ads. Analytics are limited to what the hosting providers collect by default.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>Children</h2>
        <p>AdaptCode is not directed at children under 13. If you believe a child has created an account, contact us and we&apos;ll remove it.</p>
      </section>
    </main>
  );
}
