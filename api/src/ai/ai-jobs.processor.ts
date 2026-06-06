// src/ai/ai-jobs.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AiJobStatus, Prisma } from '@prisma/client';
import { Job } from 'bullmq';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import {
    AI_QUEUE_NAME,
    AiQueueJobData,
    CreateTestJobData,
    ExtractMaterialJobData,
} from './ai-job-types';
import { AiService } from './ai.service';
import { MaterialExtractorService } from './material-extractor.service';

@Processor(AI_QUEUE_NAME)
@Injectable()
export class AiJobsProcessor extends WorkerHost {
    constructor(
        private readonly ai: AiService,
        private readonly extractor: MaterialExtractorService,
        private readonly prisma: PrismaService,
        private readonly metrics: MetricsService,
    ) {
        super();
    }

    async process(job: Job<AiQueueJobData, unknown, string>): Promise<void> {
        const startedAt = process.hrtime.bigint();
        await this.markProcessing(job.data.aiJobId);

        try {
            if (job.name === 'create-test') {
                await this.processCreateTest(job.data as CreateTestJobData);
                this.recordSuccess(job, startedAt);
                return;
            }

            if (job.name === 'extract-material') {
                await this.processExtractMaterial(
                    job.data as ExtractMaterialJobData,
                );
                this.recordSuccess(job, startedAt);
                return;
            }

            throw new Error(`Unsupported AI job type: ${job.name}`);
        } catch (error) {
            await this.markFailed(job.data.aiJobId, error);
            this.recordFailure(job, startedAt);
            throw error;
        }
    }

    private async processCreateTest(data: CreateTestJobData) {
        const result = await this.ai.createTest(data.user, data.input);
        if ('ok' in result && !result.ok) {
            throw new Error(
                result.details
                    ? `${result.message}: ${JSON.stringify(result.details)}`
                    : result.message,
            );
        }
        if ('ok' in result) {
            throw new Error('AI test generation failed');
        }
        await this.markCompleted(data.aiJobId, result as Prisma.InputJsonValue);
        this.metrics.recordAiUsage('create-test', result.model, result.usage);
    }

    private async processExtractMaterial(data: ExtractMaterialJobData) {
        const result = await this.extractor.extract({
            originalname: data.file.originalname,
            mimetype: data.file.mimetype,
            size: data.file.size,
            buffer: Buffer.from(data.file.bufferBase64, 'base64'),
        });

        await this.markCompleted(data.aiJobId, {
            fileName: result.fileName,
            mimeType: result.mimeType,
            text: result.text.slice(0, 12000),
        });
    }

    private recordSuccess(job: Job<AiQueueJobData, unknown, string>, startedAt: bigint) {
        const duration = this.durationSeconds(startedAt);
        this.metrics.recordQueueJob(AI_QUEUE_NAME, job.name, 'completed', duration);
        this.metrics.recordAiJob(job.name, 'completed', duration);
    }

    private recordFailure(job: Job<AiQueueJobData, unknown, string>, startedAt: bigint) {
        const duration = this.durationSeconds(startedAt);
        this.metrics.recordQueueJob(AI_QUEUE_NAME, job.name, 'failed', duration);
        this.metrics.recordAiJob(job.name, 'failed', duration);
        if (job.name === 'extract-material') {
            this.metrics.recordMaterialExtractError(job.name);
        }
    }

    private durationSeconds(startedAt: bigint) {
        return Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
    }

    private markProcessing(id: string) {
        return this.prisma.aiJob.update({
            where: { id },
            data: {
                status: AiJobStatus.PROCESSING,
                error: null,
            },
        });
    }

    private markCompleted(id: string, result: Prisma.InputJsonValue) {
        return this.prisma.aiJob.update({
            where: { id },
            data: {
                status: AiJobStatus.COMPLETED,
                result,
                error: null,
            },
        });
    }

    private markFailed(id: string, error: unknown) {
        return this.prisma.aiJob.update({
            where: { id },
            data: {
                status: AiJobStatus.FAILED,
                error:
                    error instanceof Error
                        ? error.message.slice(0, 2000)
                        : 'AI job failed',
            },
        });
    }
}
