"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import toast from 'react-hot-toast';

const TOPICS = [
  { id: 'basic_syntax', label: 'Basic Syntax' },
  { id: 'loops', label: 'Loops & Iteration' },
  { id: 'arrays', label: 'Arrays & Lists' },
  { id: 'strings', label: 'Strings' },
  { id: 'hashing', label: 'Hash Maps & Dictionaries' },
  { id: 'two_pointers', label: 'Two Pointers' },
  { id: 'sliding_window', label: 'Sliding Window' },
  { id: 'recursion', label: 'Recursion' },
  { id: 'backtracking', label: 'Backtracking' },
  { id: 'binary_search', label: 'Binary Search' },
  { id: 'trees', label: 'Trees & Graphs' },
  { id: 'dynamic_programming', label: 'Dynamic Programming' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await fetchApi('/api/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify({ mastered_concepts: selectedTopics })
      });
      toast.success('Onboarding complete!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error('Failed to save onboarding data.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome to AdaptCode</h1>
      <p className="text-text-secondary mb-8 text-lg">
        To personalize your learning journey, please select the programming concepts you are already comfortable with. We will use this to initialize our AI's understanding of your knowledge state.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {TOPICS.map(topic => (
          <div 
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTopics.includes(topic.id) 
                ? 'border-primary bg-primary/10 text-primary font-bold' 
                : 'border-border-default bg-surface hover:border-border-hover text-text-primary'
            }`}
          >
            {topic.label}
          </div>
        ))}
      </div>

      <div className="flex justify-end border-t border-border-default pt-6">
        <button
          onClick={handleComplete}
          disabled={saving}
          className="bg-primary text-text-primary font-bold py-3 px-8 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Start Learning'}
        </button>
      </div>
    </div>
  );
}
