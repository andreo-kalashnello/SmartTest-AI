// src/ai/ai-queue.service.ts
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Queue } from 'bullmq';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AI_QUEUE_NAME, AiQueueJobData } from './ai-job-types';
import { pendingJobResponse, serializeAiJob } from './ai-job.serializer';
import { CreateAiTestDto } from './dto/create-ai-test.dto';

@Injectable()
export class AiQueueService {
    constructor(
        @InjectQueue(AI_QUEUE_NAME)
        private readonly queue: Queue<AiQueueJobData>,
        private readonly prisma: PrismaService,
    ) {}

    async enqueueCreateTest(user: CurrentUserPayload, input: CreateAiTestDto) {
        const aiJob = await this.prisma.aiJob.create({
            data: {
                userId: user.id,
                type: 'create-test',
                input: input as Prisma.InputJsonValue,
            },
        });

        await this.queue.add(
            'create-test',
            { aiJobId: aiJob.id, user, input },
            {
                jobId: aiJob.id,
                attempts: 2,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: { age: 3600, count: 100 },
                removeOnFail: { age: 24 * 3600, count: 200 },
            },
        );

        return pendingJobResponse(aiJob);
    }

    async enqueueExtractMaterial(
        user: CurrentUserPayload,
        file: {
            originalname: string;
            mimetype: string;
            size: number;
            buffer: Buffer;
        },
    ) {
        const aiJob = await this.prisma.aiJob.create({
            data: {
                userId: user.id,
                type: 'extract-material',
                input: {
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                },
            },
        });

        await this.queue.add(
            'extract-material',
            {
                aiJobId: aiJob.id,
                file: {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    bufferBase64: file.buffer.toString('base64'),
                },
            },
            {
                jobId: aiJob.id,
                attempts: 2,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: { age: 3600, count: 100 },
                removeOnFail: { age: 24 * 3600, count: 200 },
            },
        );

        return pendingJobResponse(aiJob);
    }

    async getJob(user: CurrentUserPayload, id: string) {
        const aiJob = await this.prisma.aiJob.findFirst({
            where: {
                id,
                userId: user.id,
            },
        });
        if (!aiJob)
            throw new NotFoundException({ message: 'AI job not found' });
        return { job: serializeAiJob(aiJob) };
    }
}
