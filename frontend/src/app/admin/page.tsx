"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Users, BookOpen, Activity, X } from 'lucide-react';
import Navbar from '@/components/adapt/Navbar';
import Footer from '@/components/adapt/Footer';
import { useAuth } from '@/lib/auth-context';
import { adminAPI, API_ENABLED, type ApiAdminProblem, type ApiAdminStats, type ApiAdminUser, type ProblemInput } from '@/lib/api';
import toast from 'react-hot-toast';

const CONCEPT_TAGS = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming'] as const;

const EMPTY_PROBLEM: ProblemInput = {
  title: '',
  description: '',
  concept_tag: 'arrays',
  difficulty_level: 'easy',
  test_cases: [{ input: '', expected_output: '' }],
  hint_text: '',
};

export default function AdminPage() {
  const { user, status } = useAuth();
  const [problems, setProblems] = useState<ApiAdminProblem[]>([]);
  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [stats, setStats] = useState<ApiAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApiAdminProblem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<ProblemInput>(EMPTY_PROBLEM);

  const isAdmin = user?.role === 'admin';

  async function refresh() {
    if (!API_ENABLED) { setLoading(false); return; }
    try {
      const [p, s, u] = await Promise.all([
        adminAPI.listProblems(),
        adminAPI.stats(),
        adminAPI.users(),
      ]);
      setProblems(p.data || []);
      setStats(s.data);
      setUsers(u.data || []);
    } catch (e) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authed' && isAdmin) void refresh();
    else if (status !== 'loading') setLoading(false);
  }, [status, isAdmin]);

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--tx-2)' }}>Loading…</div>
      </>
    );
  }

  if (status !== 'authed' || !isAdmin) {
    return (
      <>
        <Navbar />
        <div className="land">
          <main className="mast-main" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h1>Admin only</h1>
            <p style={{ color: 'var(--tx-2)', marginTop: 12 }}>
              This page is restricted to users with the <code>admin</code> role.
            </p>
            <Link href="/" style={{ color: 'var(--accent)', marginTop: 20, display: 'inline-block' }}>← home</Link>
          </main>
        </div>
      </>
    );
  }

  function openEdit(p: ApiAdminProblem) {
    setEditing(p);
    setDraft({
      title: p.title,
      description: p.description,
      concept_tag: p.concept_tag,
      difficulty_level: p.difficulty_level,
      test_cases: p.test_cases?.length ? p.test_cases : [{ input: '', expected_output: '' }],
      hint_text: p.hint_text ?? '',
      solution_code: p.solution_code ?? '',
      solution_explanation: p.solution_explanation ?? '',
      starter_code: p.starter_code ?? null,
    });
  }

  function openCreate() {
    setCreating(true);
    setDraft(EMPTY_PROBLEM);
  }

  async function save() {
    try {
      if (editing) {
        await adminAPI.updateProblem(editing.problem_id, draft);
        toast.success('Problem updated');
      } else {
        await adminAPI.createProblem(draft);
        toast.success('Problem created');
      }
      setEditing(null);
      setCreating(false);
      void refresh();
    } catch (e) {
      toast.error('Save failed');
    }
  }

  async function remove(p: ApiAdminProblem) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteProblem(p.problem_id);
      toast.success('Deleted');
      void refresh();
    } catch {
      toast.error('Delete failed');
    }
  }

  const modalOpen = creating || !!editing;

  return (
    <>
      <Navbar />
      <div className="land">
        <main className="mast-main">
          <header className="mast-head">
            <div className="mast-head-text">
              <h1>Admin</h1>
              <p>Platform stats, user list, and problem bank management.</p>
            </div>
          </header>

          {stats && (
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              <StatCard icon={<Users size={16} />} label="Total users" value={stats.total_users} />
              <StatCard icon={<Activity size={16} />} label="Sessions" value={stats.total_sessions} />
              <StatCard icon={<BookOpen size={16} />} label="Submissions" value={stats.total_submissions} />
            </section>
          )}

          <section style={{ marginBottom: 32 }}>
            <div className="section-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16 }}>Problems ({problems.length})</h2>
              <button className="btn btn-learn" onClick={openCreate}>
                <Plus size={13} /> New problem
              </button>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Title</th>
                  <th style={{ width: 160 }}>Concept</th>
                  <th style={{ width: 90 }}>Difficulty</th>
                  <th style={{ width: 90 }}>Tests</th>
                  <th style={{ width: 120 }}></th>
                </tr>
              </thead>
              <tbody>
                {problems.slice(0, 50).map((p) => (
                  <tr key={p.problem_id}>
                    <td>{p.title}</td>
                    <td style={{ color: 'var(--tx-2)' }}>{p.concept_tag}</td>
                    <td>
                      <span className={`diff diff-${p.difficulty_level[0]}`}>
                        {p.difficulty_level[0].toUpperCase() + p.difficulty_level.slice(1)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--tx-2)' }}>{p.test_cases?.length ?? 0}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="ps-icon" title="Edit" onClick={() => openEdit(p)}><Pencil size={12} /></button>
                      <button className="ps-icon" title="Delete" onClick={() => remove(p)}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {problems.length > 50 && (
              <p style={{ color: 'var(--tx-3)', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
                Showing first 50 of {problems.length}. Full management uses the DB directly.
              </p>
            )}
          </section>

          <section>
            <div className="section-h">
              <h2 style={{ fontSize: 16 }}>Users ({users.length})</h2>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Display name</th>
                  <th style={{ width: 90 }}>Role</th>
                  <th style={{ width: 140 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 25).map((u) => (
                  <tr key={u.user_id}>
                    <td>{u.email}</td>
                    <td>{u.display_name || <span style={{ color: 'var(--tx-3)' }}>—</span>}</td>
                    <td style={{ color: u.role === 'admin' ? 'var(--accent)' : 'var(--tx-2)' }}>{u.role || 'student'}</td>
                    <td style={{ color: 'var(--tx-2)', fontSize: 12 }}>{u.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
        <Footer />
      </div>

      {modalOpen && (
        <div
          role="dialog"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)',
            display: 'grid', placeItems: 'center', zIndex: 100, padding: 16,
          }}
          onClick={() => { setCreating(false); setEditing(null); }}
        >
          <div
            style={{
              background: 'var(--bg-1)', border: '1px solid var(--border-t)',
              borderRadius: 12, padding: 24, width: '100%', maxWidth: 680,
              maxHeight: '90vh', overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{editing ? 'Edit problem' : 'New problem'}</h3>
              <button className="ps-icon" onClick={() => { setCreating(false); setEditing(null); }}><X size={14} /></button>
            </div>

            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                style={inputStyle}
              />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Concept">
                <select
                  value={draft.concept_tag}
                  onChange={(e) => setDraft({ ...draft, concept_tag: e.target.value })}
                  style={inputStyle}
                >
                  {CONCEPT_TAGS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Difficulty">
                <select
                  value={draft.difficulty_level}
                  onChange={(e) => setDraft({ ...draft, difficulty_level: e.target.value as 'easy' | 'medium' | 'hard' })}
                  style={inputStyle}
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={5}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </Field>
            <Field label="Hint (optional)">
              <input
                value={draft.hint_text ?? ''}
                onChange={(e) => setDraft({ ...draft, hint_text: e.target.value })}
                style={inputStyle}
              />
            </Field>

            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--tx-2)', marginTop: 16, marginBottom: 8 }}>
              Test cases ({draft.test_cases.length})
            </div>
            {draft.test_cases.map((tc, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <input
                  placeholder="input"
                  value={tc.input}
                  onChange={(e) => {
                    const copy = [...draft.test_cases];
                    copy[i] = { ...copy[i], input: e.target.value };
                    setDraft({ ...draft, test_cases: copy });
                  }}
                  style={inputStyle}
                />
                <input
                  placeholder="expected output"
                  value={tc.expected_output}
                  onChange={(e) => {
                    const copy = [...draft.test_cases];
                    copy[i] = { ...copy[i], expected_output: e.target.value };
                    setDraft({ ...draft, test_cases: copy });
                  }}
                  style={inputStyle}
                />
                <button
                  className="ps-icon"
                  onClick={() => setDraft({ ...draft, test_cases: draft.test_cases.filter((_, j) => j !== i) })}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              className="ps-icon"
              onClick={() => setDraft({ ...draft, test_cases: [...draft.test_cases, { input: '', expected_output: '' }] })}
              style={{ marginTop: 4 }}
            >
              <Plus size={12} /> add test
            </button>

            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button>
              <button className="btn btn-learn" onClick={save}>
                {editing ? 'Save changes' : 'Create problem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: 'var(--bg-2)',
  border: '1px solid var(--border-t)',
  borderRadius: 8,
  color: 'var(--tx-1)',
  fontSize: 14,
  fontFamily: 'inherit',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--tx-2)', marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{
      padding: '16px 20px',
      border: '1px solid var(--border-t)',
      borderRadius: 10,
      background: 'var(--bg-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--tx-2)', marginBottom: 6 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--tx-1)' }}>{value.toLocaleString()}</div>
    </div>
  );
}
