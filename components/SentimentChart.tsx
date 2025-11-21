import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SentimentPoint } from '../types';
import { Activity } from 'lucide-react';

interface SentimentChartProps {
  data: SentimentPoint[];
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate average for reference line
  const averageScore = data.reduce((acc, curr) => acc + curr.score, 0) / (data.length || 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            情感趋势分析
          </h2>
          <p className="text-sm text-slate-500">通话过程中的情绪基调变化</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 积极
            </div>
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 中性
            </div>
            <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> 消极
            </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="timeOffset" 
              tickFormatter={formatTime} 
              tick={{fontSize: 12, fill: '#64748b'}}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              hide={false}
              tick={{fontSize: 12, fill: '#64748b'}}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelFormatter={(label) => `时间: ${formatTime(label as number)}`}
              formatter={(value: number) => [`${value}/100`, '参与度评分']}
            />
            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};