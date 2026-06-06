// src/ai/ai-job.serializer.ts
import { AiJob, AiJobStatus } from '@prisma/client';

export function serializeAiJob(job: AiJob) {
    return {
        id: job.id,
        type: job.type,
        status: job.status,
        input: job.input,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
    };
}

export function pendingJobResponse(job: AiJob) {
    return {
        job: serializeAiJob(job),
    };
}

export function isTerminalAiJobStatus(status: AiJobStatus) {
    return status === AiJobStatus.COMPLETED || status === AiJobStatus.FAILED;
}
