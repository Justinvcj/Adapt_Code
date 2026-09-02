"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await api.get('/problems');
        setProblems(data.data || []);
      } catch (e) {
        console.error("Failed to load problems", e);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-success bg-success/10';
      case 'medium': return 'text-medium bg-medium/10';
      case 'hard': return 'text-hard bg-hard/10';
      default: return 'text-on-surface-variant bg-surface-bright';
    }
  };

  return (
    <>
      <div className="max-w-[1440px] mx-auto w-full gap-lg">
        <div className="w-full flex flex-col gap-lg">
          <div className="bg-surface-elevated rounded-xl border border-border-default overflow-hidden">
            <div className="p-4 border-b border-border-default flex items-center justify-between">
              <h2 className="font-headline-sm text-[18px] text-text-primary">Problem Library</h2>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-default text-on-surface-variant font-label-bold text-label-bold">
                  <th className="py-3 px-4 font-medium w-12">#</th>
                  <th className="py-3 px-4 font-medium">Title</th>
                  <th className="py-3 px-4 font-medium w-32 text-center">Difficulty</th>
                  <th className="py-3 px-4 font-medium">Concept</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-on-surface-variant">Loading problems...</td></tr>
                ) : problems.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-on-surface-variant">No problems found</td></tr>
                ) : (
                  problems.map((p, i) => (
                    <tr 
                      key={p.id} 
                      onClick={() => router.push(`/problem/${p.id}`)}
                      className="border-b border-border-default hover:bg-surface-secondary transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4 text-on-surface-variant">{i + 1}</td>
                      <td className="py-3 px-4">
                        <span className="text-text-primary group-hover:text-secondary transition-colors font-medium">
                          {p.title}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-label-bold w-full max-w-[80px] ${getDifficultyColor(p.difficulty_level)}`}>
                          {p.difficulty_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-sm">
                        <span className="bg-surface-bright px-2 py-1 rounded">
                          {p.concept_tag}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}