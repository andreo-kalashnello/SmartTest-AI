export type ScannedSource = {
  id: string;
  fileName: string;
  charCount: number;
  text: string;
};

export type ScannedSourceDraft = {
  id: string;
  fileName: string;
  status: "scanning" | "ready" | "error";
  charCount?: number;
  text?: string;
  error?: string;
};
