import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING, description: "说话人名称 (必须使用: '销售员' 或 '客户')" },
          text: { type: Type.STRING, description: "说话内容" },
          timestamp: { type: Type.STRING, description: "格式 MM:SS" }
        },
        required: ["speaker", "text", "timestamp"]
      }
    },
    sentimentGraph: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          timeOffset: { type: Type.NUMBER, description: "距离开始的秒数" },
          score: { type: Type.NUMBER, description: "情感得分 0 (非常消极) 到 100 (非常积极)" },
          label: { type: Type.STRING, description: "简短的情感状态标签 (例如: 积极, 紧张, 中性)" }
        },
        required: ["timeOffset", "score", "label"]
      }
    },
    coaching: {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "销售员的亮点/做得好的地方 (中文)"
        },
        missedOpportunities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "改进空间或错失的销售机会 (中文)"
        },
        summary: { type: Type.STRING, description: "通话结果的简短执行摘要 (中文)" }
      },
      required: ["strengths", "missedOpportunities", "summary"]
    }
  },
  required: ["transcript", "sentimentGraph", "coaching"]
};

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: `分析这段销售通话音频。请务必使用中文回复所有内容。
            1. 转录对话。必须将说话人识别为 '销售员' 和 '客户'。如果无法确定，请根据上下文推断谁在进行推销。
            2. 分析整个通话的情感。每隔约15-30秒或在关键情绪转变时生成数据点以绘制图表。
            3. 扮演世界级的销售教练。基于顾问式销售的方法论，提供3个具体的亮点和3个改进空间。`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "你是一位专业的销售教练AI助手。你分析音频通话以提供文字记录、情感追踪和可操作的反馈。所有输出必须是中文。",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Gemini 没有返回响应");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};