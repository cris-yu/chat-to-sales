import React from 'react';
import { CoachingInsights } from '../types';
import { CheckCircle2, AlertCircle, Quote } from 'lucide-react';

interface CoachingCardProps {
  data: CoachingInsights;
}

export const CoachingCard: React.FC<CoachingCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="bg-indigo-50/50 p-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Quote className="w-5 h-5 text-indigo-600" />
          智能辅导建议
        </h2>
        <p className="text-sm text-slate-500 mt-1">{data.summary}</p>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto">
        {/* Strengths */}
        <div>
          <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            亮点 / 优势
          </h3>
          <ul className="space-y-3">
            {data.strengths.map((point, index) => (
              <li key={index} className="flex items-start gap-3 bg-green-50/50 p-3 rounded-lg border border-green-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div>
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            改进空间
          </h3>
          <ul className="space-y-3">
            {data.missedOpportunities.map((point, index) => (
              <li key={index} className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};