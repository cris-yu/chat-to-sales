import React, { useState, useRef } from 'react';
import { Upload, Mic, Loader2, FileAudio, StopCircle, X, AlertCircle } from 'lucide-react';
import { AppState } from '../types';
import { clsx } from 'clsx';

interface UploadSectionProps {
  appState: AppState;
  onFileUpload: (file: File) => void;
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
  error?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ 
  appState, 
  onFileUpload, 
  onRecordingComplete,
  onRecordingStart,
  onCancel,
  onError,
  error 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        onFileUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const startRecording = async () => {
    onError(''); // Clear previous errors
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Notify parent that recording is starting successfully
      onRecordingStart();

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        onRecordingComplete(blob);
        // Cleanup tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      // Timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      let errorMessage = "无法访问麦克风。";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "麦克风权限被拒绝。请在浏览器地址栏中允许访问麦克风，然后重试。";
      } else if (err.name === 'NotFoundError') {
        errorMessage = "未检测到麦克风设备。请检查您的设备连接。";
      } else if (err.name === 'NotReadableError') {
        errorMessage = "麦克风可能被其他应用程序占用。请关闭其他录音软件后重试。";
      }
      
      onError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Prevent onstop from triggering completion
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    // Cleanup tracks immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingTime(0);
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (appState === AppState.PROCESSING) {
    return (
      <div className="w-full max-w-2xl mx-auto p-12 text-center bg-white rounded-3xl shadow-sm border border-slate-200">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">正在智能分析...</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Gemini 正在转录音频、分析情感变化并生成销售辅导建议。请稍候...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={clsx(
          "relative border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden bg-white",
          isDragOver ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50",
          appState === AppState.RECORDING ? "border-red-400 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12 text-center">
          
          {appState === AppState.RECORDING ? (
            <div className="flex flex-col items-center animate-pulse">
               <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-6">
                <Mic className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">正在录音...</h3>
              <p className="text-3xl font-mono text-red-500 font-bold mb-8">{formatTime(recordingTime)}</p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={cancelRecording}
                  className="inline-flex items-center justify-center w-12 h-12 bg-white text-slate-500 rounded-full font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200 shadow-sm"
                  title="取消录音"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  <StopCircle className="w-5 h-5" />
                  停止录音
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <FileAudio className="w-10 h-10" />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-2">上传销售录音</h3>
              <p className="text-slate-500 mb-8 max-w-md">
                拖放音频文件 (MP3, WAV, M4A) 到此处，或直接开始录音进行分析。
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm mx-auto">
                <label className="flex-1 w-full">
                  <input type="file" className="hidden" accept="audio/*,video/*" onChange={handleFileChange} />
                  <span className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium cursor-pointer hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg w-full">
                    <Upload className="w-5 h-5" />
                    上传文件
                  </span>
                </label>
                
                <div className="hidden sm:flex items-center text-slate-300 font-medium">或</div>
                
                <button
                  onClick={startRecording}
                  className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <Mic className="w-5 h-5" />
                  开始录音
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};