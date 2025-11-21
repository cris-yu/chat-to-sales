import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { UploadSection } from './components/UploadSection';
import { Transcript } from './components/Transcript';
import { SentimentChart } from './components/SentimentChart';
import { CoachingCard } from './components/CoachingCard';
import { analyzeAudio } from './services/geminiService';
import { Sparkles, BarChart3, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | undefined>();

  const processAudio = async (blob: Blob) => {
    setAppState(AppState.PROCESSING);
    setError(undefined);
    try {
      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        // Strip prefix (e.g. "data:audio/mp3;base64,")
        const base64Content = base64Data.split(',')[1];
        const mimeType = blob.type || 'audio/mp3'; // Default fallback

        try {
            const result = await analyzeAudio(base64Content, mimeType);
            setAnalysisResult(result);
            setAppState(AppState.COMPLETE);
        } catch (apiError) {
             console.error(apiError);
             setError("分析失败。请尝试较短的音频文件，或者检查您的网络连接是否正常。");
             setAppState(AppState.ERROR);
        }
      };
    } catch (err) {
      console.error(err);
      setError("处理音频文件时发生错误。");
      setAppState(AppState.ERROR);
    }
  };

  const handleFileUpload = (file: File) => {
    processAudio(file);
  };

  const handleRecordingComplete = (blob: Blob) => {
    processAudio(blob);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setAppState(AppState.IDLE);
    setError(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">SalesIQ</h1>
          </div>
          {appState === AppState.COMPLETE && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              分析新通话
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload / Recording State */}
        {(appState === AppState.IDLE || appState === AppState.RECORDING || appState === AppState.PROCESSING || appState === AppState.ERROR) && (
          <div className="mt-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                将对话转化为<span className="text-indigo-600">收入</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                上传销售通话录音，即刻获取 AI 辅导、情感趋势分析以及区分说话人的文字记录。
              </p>
            </div>
            <UploadSection 
              appState={appState}
              onFileUpload={handleFileUpload}
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={() => setAppState(AppState.RECORDING)}
              onCancel={() => {
                setAppState(AppState.IDLE);
                setError(undefined);
              }}
              onError={(msg) => setError(msg)}
              error={error}
            />
          </div>
        )}

        {/* Dashboard State */}
        {appState === AppState.COMPLETE && analysisResult && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats / Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 h-96">
                <SentimentChart data={analysisResult.sentimentGraph} />
              </div>
              <div className="h-96">
                <CoachingCard data={analysisResult.coaching} />
              </div>
            </div>

            {/* Transcript Row */}
            <div className="h-[600px]">
              <Transcript transcript={analysisResult.transcript} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;