// src/ai/ai-job-types.ts
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { CreateAiTestDto } from './dto/create-ai-test.dto';

export const AI_QUEUE_NAME = 'ai-generation';

export type AiQueueJobName = 'create-test' | 'extract-material';

export type CreateTestJobData = {
    aiJobId: string;
    user: CurrentUserPayload;
    input: CreateAiTestDto;
};

export type ExtractMaterialJobData = {
    aiJobId: string;
    file: {
        originalname: string;
        mimetype: string;
        size: number;
        bufferBase64: string;
    };
};

export type AiQueueJobData = CreateTestJobData | ExtractMaterialJobData;
