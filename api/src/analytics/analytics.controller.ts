//src/analytics/analytics.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
    CurrentUser,
    CurrentUserPayload,
} from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { idParamsSchema } from '../tests/dto/test-input.dto';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analytics: AnalyticsService) {}

    @Get('teacher')
    @Roles(Role.TEACHER)
    teacher(@CurrentUser() user: CurrentUserPayload) {
        return this.analytics.teacher(user);
    }

    @Get('student')
    @Roles(Role.STUDENT)
    student(@CurrentUser() user: CurrentUserPayload) {
        return this.analytics.student(user);
    }

    @Get('subject/:id')
    @Roles(Role.TEACHER)
    subject(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.analytics.subject(user, params.id);
    }
}
