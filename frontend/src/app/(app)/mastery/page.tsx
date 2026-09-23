"use client";

import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import toast from 'react-hot-toast';

export default function MasteryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMastery() {
      try {
        const res = await fetchApi('/api/mastery');
        // Sort for BarChart so highest mastery is first, or keep logical order
        setData(res.data);
      } catch (err) {
        toast.error("Failed to load mastery data");
      } finally {
        setLoading(false);
      }
    }
    loadMastery();
  }, []);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading mastery data...</div>;
  }

  const chartData = data.map(d => ({
    subject: d.concept_tag,
    A: Math.round(d.mastery_probability * 100),
    fullMark: 100,
    unlocked: d.is_unlocked,
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-8">Knowledge Mastery & Concept DAG</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Radar Chart */}
        <div className="bg-surface-elevated border border-border-default p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Mastery Radar</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#3A3A4A" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#E0E0E0', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#888' }} />
                <Radar name="Mastery %" dataKey="A" stroke="#7C3AED" fill="#8B5CF6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E1E2E', borderColor: '#3A3A4A', color: '#E0E0E0' }}
                  formatter={(value: any) => [`${value}%`, 'Mastery']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-surface-elevated border border-border-default p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Concept Probabilities</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A4A" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="subject" type="category" tick={{ fill: '#E0E0E0', fontSize: 12 }} width={100} />
                <Tooltip 
                  cursor={{fill: '#2A2A35'}}
                  contentStyle={{ backgroundColor: '#1E1E2E', borderColor: '#3A3A4A', color: '#E0E0E0' }}
                  formatter={(value: any) => [`${value}%`, 'Mastery']}
                />
                <Bar dataKey="A" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.unlocked ? '#10B981' : '#6B7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* DAG / Prerequisites List */}
      <div className="bg-surface-elevated border border-border-default p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Concept Prerequisites (DAG Status)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(concept => (
            <div 
              key={concept.concept_tag} 
              className={`p-4 rounded border ${concept.is_unlocked ? 'border-success/50 bg-success/10' : 'border-border-default bg-surface opacity-75'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">{concept.concept_tag}</h3>
                {concept.is_unlocked ? (
                  <span className="material-symbols-outlined text-success text-sm">lock_open</span>
                ) : (
                  <span className="material-symbols-outlined text-text-secondary text-sm">lock</span>
                )}
              </div>
              <p className="text-sm mb-2 text-text-secondary">
                Mastery: {(concept.mastery_probability * 100).toFixed(1)}%
              </p>
              <div className="text-xs">
                <strong>Prerequisites:</strong>
                {concept.prerequisites && concept.prerequisites.length > 0 ? (
                  <ul className="list-disc pl-4 mt-1 text-text-secondary">
                    {concept.prerequisites.map((p: string) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-text-secondary ml-1">None</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
