"use client";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, ChevronRight, Lock } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import { CONCEPT_BY_ID, MOCK_MASTERY, type ConceptId } from '@/data/concepts';
import { PROBLEMS } from '@/components/adapt/data';
import { PROBLEM_LIST, PROBLEMS_BY_CONCEPT } from '@/data/problems';
import toast from 'react-hot-toast';

const SLUG_BY_ID: Record<number, string> = PROBLEM_LIST.reduce((acc, p) => { acc[p.id] = p.slug; return acc; }, {} as Record<number, string>);

export default function ConceptMasteryPage() {
  const params = useParams<{ concept: string }>();
  const router = useRouter();
  const conceptId = (params?.concept as ConceptId) || null;
  const concept = conceptId ? CONCEPT_BY_ID[conceptId] : undefined;

  if (!concept) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 60, textAlign: 'center' }}>
          <h2>Unknown concept</h2>
          <p style={{ color: 'var(--tx-2)', marginTop: 8 }}>
            <Link href="/mastery" style={{ color: 'var(--blue)' }}>← back to Mastery</Link>
          </p>
        </div>
      </>
    );
  }

  const m = MOCK_MASTERY[concept.id];
  const Icon = concept.icon;

  // Real problems for this concept come first; fill the rest with other problems
  // so the catalogue page is never empty while the bank is still growing.
  const conceptSlugs = new Set(PROBLEMS_BY_CONCEPT[concept.id] ?? []);
  const inConcept = PROBLEM_LIST
    .filter((p) => conceptSlugs.has(p.slug))
    .map((p) => ({ id: p.id, title: p.title, diff: p.difficulty, acc: p.acceptance, st: '' as const, _real: true }));
  const seed = concept.id.length;
  const filler = PROBLEMS
    .map((p, i) => ({ ...p, _o: ((i + seed) * 2654435761) >>> 0, _real: false as const }))
    .sort((a, b) => a._o - b._o)
    .slice(0, Math.max(0, 18 - inConcept.length))
    .map(({ _o, ...p }) => p);
  const scoped = [...inConcept, ...filler];

  const total = concept.problems.easy + concept.problems.medium + concept.problems.hard;

  return (
    <>
      <Navbar active="mastery" />
      <div className="land">
        <main className="cm-main">
          <nav className="cm-breadcrumb">
            <Link href="/mastery">Mastery</Link>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--tx)' }}>{concept.title}</span>
          </nav>

          <section className="cm-hero">
            <div className="cm-hero-icon">
              {m.unlocked
                ? <Icon size={32} color="#010102" strokeWidth={1.75} />
                : <Lock size={28} color="#010102" strokeWidth={1.75} />}
            </div>
            <div className="cm-hero-info">
              <h1>{concept.title}</h1>
              <p>{concept.long}</p>
              <div className="cm-hero-stats">
                <div><span>Mastery</span><b style={{ color: 'var(--accent)' }}>{Math.round(m.mastery * 100)}%</b></div>
                <div><span>Solved</span><b>{m.solved} / {total}</b></div>
                <div><span>Difficulty</span><b>{concept.problems.easy}E · {concept.problems.medium}M · {concept.problems.hard}H</b></div>
                <div><span>State</span><b style={{ color: m.unlocked ? 'var(--solved)' : 'var(--tx-3)' }}>{m.unlocked ? 'Unlocked' : 'Locked'}</b></div>
              </div>
            </div>
            {m.unlocked && (
              <button className="btn btn-learn" onClick={() => router.push('/learn')}>
                <Play size={13} fill="currentColor" /> Continue learning
              </button>
            )}
          </section>

          <section>
            <div className="section-h">
              <h2 style={{ fontSize: 16 }}>Problems in {concept.title}</h2>
              <span className="meta">{scoped.length} shown · sorted by recommendation</span>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th style={{ width: 56 }}>#</th>
                  <th>Title</th>
                  <th style={{ width: 100 }}>Acceptance</th>
                  <th style={{ width: 90 }}>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {scoped.map((p) => {
                  const dc = p.diff === 'Easy' ? 'e' : p.diff === 'Medium' ? 'm' : 'h';
                  return (
                    <tr key={p.id}>
                      <td>{p.st === 'solved' ? <span className="solved-icon">✓</span> : p.st === 'attempted' ? <span className="attempted-icon">○</span> : ''}</td>
                      <td style={{ color: 'var(--tx-2)' }}>{p.id}.</td>
                      <td className="t-link">
                        <Link
                          href={`/problem/${SLUG_BY_ID[p.id] ?? 'coming-soon'}`}
                          style={{ color: 'inherit' }}
                          onClick={(e) => { if (!m.unlocked) { e.preventDefault(); toast('Concept is locked — complete prerequisites first.'); } }}
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td>{p.acc}%</td>
                      <td><span className={`diff diff-${dc}`}>{p.diff}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
