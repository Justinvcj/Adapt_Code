import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service · AdaptCode',
  description: 'Terms of Service for the AdaptCode adaptive learning platform.',
};

/**
 * Placeholder Terms of Service page.
 *
 * Google OAuth provider verification requires a publicly reachable Terms URL
 * for apps that request user profile scopes. This page exists to satisfy
 * that requirement; the content below is a reasonable starting point for
 * a hobbyist / educational project, but you should have a lawyer review it
 * before you accept a real user base.
 */
export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 96px', color: 'var(--tx)', lineHeight: 1.6 }}>
      <Link href="/" style={{ color: 'var(--tx-2)', fontSize: 13 }}>← Back</Link>
      <h1 style={{ fontSize: 28, marginTop: 24, marginBottom: 16 }}>Terms of Service</h1>
      <p style={{ color: 'var(--tx-2)', fontSize: 13, marginBottom: 32 }}>Last updated: 2026-11-08</p>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>1. What AdaptCode is</h2>
        <p>AdaptCode is an educational platform for practicing data-structures-and-algorithms problems. Your submissions are graded by a sandboxed code-execution service; AdaptCode tracks your per-concept mastery to recommend what to practice next.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>2. Your account</h2>
        <p>You may create an account with an email + password or by signing in with a supported OAuth provider. You are responsible for keeping your credentials private. Do not share your account.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>3. Acceptable use</h2>
        <p>Do not submit code intended to break out of the sandbox, scrape the problem catalogue en masse, or attack the service. Automated clients may be rate-limited or blocked.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>4. Content you submit</h2>
        <p>You retain ownership of the code you write. By submitting it you grant us a limited license to run it in the sandbox, store it for your own history, and compute mastery signals from the outcome.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>5. Termination</h2>
        <p>You may delete your account at any time from the settings page. We may suspend accounts that violate these terms.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>6. No warranty</h2>
        <p>The service is provided as-is, without warranties of any kind. Mastery scores and problem recommendations are best-effort educational signals, not professional assessments.</p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginTop: 24, marginBottom: 10 }}>7. Contact</h2>
        <p>Questions? Open an issue at <a href="https://github.com/Justinvcj/Adapt_Code/issues">github.com/Justinvcj/Adapt_Code/issues</a>.</p>
      </section>
    </main>
  );
}
