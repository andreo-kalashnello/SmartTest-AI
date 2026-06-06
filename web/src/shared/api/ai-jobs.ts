import { apiFetch } from "./client";

type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type AiJob<TInput = unknown, TResult = unknown> = {
  id: string;
  type: string;
  status: AiJobStatus;
  input: TInput;
  result: TResult | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

type AiJobResponse<TResult> = {
  job: AiJob<unknown, TResult>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForAiJob<TResult>(
  jobId: string,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<TResult> {
  const timeoutMs = options.timeoutMs ?? 180_000;
  const intervalMs = options.intervalMs ?? 1500;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { job } = await apiFetch<AiJobResponse<TResult>>(`/ai/jobs/${jobId}`);

    if (job.status === "COMPLETED") {
      if (job.result === null) throw new Error("AI job completed without result");
      return job.result;
    }

    if (job.status === "FAILED") {
      throw new Error(job.error ?? "AI job failed");
    }

    await sleep(intervalMs);
  }

  throw new Error("AI job timed out");
}
