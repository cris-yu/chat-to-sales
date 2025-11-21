import React from 'react';
import { TranscriptSegment } from '../types';
import { MessageSquare, User, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface TranscriptProps {
  transcript: TranscriptSegment[];
}

export const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          通话文字记录
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {transcript.map((segment, idx) => {
          // Check for both English and Chinese speaker labels
          const speakerLower = segment.speaker.toLowerCase();
          const isSalesperson = speakerLower.includes('salesperson') || 
                                speakerLower.includes('销售') || 
                                speakerLower.includes('顾问') || 
                                speakerLower.includes('speaker a');
          
          return (
            <div key={idx} className={clsx(
              "flex gap-4 max-w-3xl",
              isSalesperson ? "ml-auto flex-row-reverse" : ""
            )}>
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                isSalesperson ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
              )}>
                {isSalesperson ? <UserCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              
              <div className={clsx(
                "flex flex-col",
                isSalesperson ? "items-end" : "items-start"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">{segment.speaker}</span>
                  <span className="text-xs text-slate-400 font-mono">{segment.timestamp}</span>
                </div>
                <div className={clsx(
                  "p-3 rounded-2xl text-sm leading-relaxed max-w-md shadow-sm",
                  isSalesperson 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200"
                )}>
                  {segment.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};