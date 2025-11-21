export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
}

export interface SentimentPoint {
  timeOffset: number; // in seconds
  score: number; // 0 to 100
  label: string; // e.g., "Positive", "Neutral", "Tension"
}

export interface CoachingInsights {
  strengths: string[];
  missedOpportunities: string[];
  summary: string;
}

export interface AnalysisResult {
  transcript: TranscriptSegment[];
  sentimentGraph: SentimentPoint[];
  coaching: CoachingInsights;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}