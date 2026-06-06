// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '../auth/auth.module';
import { TestsModule } from '../tests/tests.module';
import { AI_QUEUE_NAME } from './ai-job-types';
import { AiJobsProcessor } from './ai-jobs.processor';
import { AiQueueService } from './ai-queue.service';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MaterialExtractorService } from './material-extractor.service';
import { OpenRouterService } from './openrouter.service';

@Module({
    imports: [
        AuthModule,
        TestsModule,
        BullModule.registerQueue({ name: AI_QUEUE_NAME }),
    ],
    controllers: [AiController],
    providers: [
        AiService,
        OpenRouterService,
        MaterialExtractorService,
        AiQueueService,
        AiJobsProcessor,
    ],
})
export class AiModule {}
