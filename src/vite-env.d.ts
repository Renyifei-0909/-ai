/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI?: {
      selectVideoFile: () => Promise<string | null>;
      exportVideo: (args: { inputPath: string; outputPath: string; start?: number; end?: number }) => Promise<void>;
      getVideoInfo: (path: string) => Promise<{ duration: number; width: number; height: number; fps?: number }>;
      aiTranscribe: (videoPath: string) => Promise<{ success: boolean; message?: string }>;
    };
  }
}

export {};
