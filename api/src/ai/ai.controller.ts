//
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    CurrentUser,
    CurrentUserPayload,
} from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { idParamsSchema } from '../tests/dto/test-input.dto';
import { AiQueueService } from './ai-queue.service';
import { createAiTestSchema, CreateAiTestDto } from './dto/create-ai-test.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class AiController {
    constructor(private readonly aiQueue: AiQueueService) {}

    @Post('jobs/create-test')
    @HttpCode(202)
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    createTestJob(
        @CurrentUser() user: CurrentUserPayload,
        @Body(new ZodValidationPipe(createAiTestSchema)) body: CreateAiTestDto,
    ) {
        return this.aiQueue.enqueueCreateTest(user, body);
    }

    @Post('jobs/extract-material')
    @HttpCode(202)
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    @UseInterceptors(FileInterceptor('file'))
    extractMaterialJob(
        @CurrentUser() user: CurrentUserPayload,
        @UploadedFile()
        file:
            | {
                  originalname: string;
                  mimetype: string;
                  size: number;
                  buffer: Buffer;
              }
            | undefined,
    ) {
        if (!file)
            throw new BadRequestException({
                message: 'File is required (field name: file)',
            });
        return this.aiQueue.enqueueExtractMaterial(user, file);
    }

    @Get('jobs/:id')
    getJob(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.aiQueue.getJob(user, params.id);
    }
}
