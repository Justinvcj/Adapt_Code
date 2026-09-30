import React from 'react';
import { Star, Award, Trophy, CheckCircle, Flame, Shield } from 'lucide-react';

type BadgeProps = {
  data: { id: string; name: string; description: string; icon: string }[];
};

export default function Badges({ data }: BadgeProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Star': return <Star className="w-8 h-8 text-yellow-400" />;
      case 'Award': return <Award className="w-8 h-8 text-blue-400" />;
      case 'Trophy': return <Trophy className="w-8 h-8 text-purple-400" />;
      case 'CheckBadge': return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'Flame': return <Flame className="w-8 h-8 text-orange-400" />;
      default: return <Shield className="w-8 h-8 text-slate-400" />;
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-medium text-slate-200 mb-4">Earned Badges</h2>
      <div className="flex flex-wrap gap-4">
        {data.map(b => (
          <div key={b.id} className="flex flex-col items-center bg-slate-800/50 border border-slate-700/50 p-4 rounded-xl w-32 text-center hover:bg-slate-800 transition-colors">
            <div className="mb-3">
              {getIcon(b.icon)}
            </div>
            <h3 className="font-medium text-sm text-slate-200 leading-tight mb-1">{b.name}</h3>
            <p className="text-[10px] text-slate-400 leading-tight">{b.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
