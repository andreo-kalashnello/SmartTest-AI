//src/subjects/subjects.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
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
import { subjectInputSchema, SubjectInputDto } from './dto/subject.dto';
import { SubjectsService } from './subjects.service';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
    constructor(private readonly subjects: SubjectsService) {}

    @Get()
    list(@CurrentUser() user: CurrentUserPayload) {
        return this.subjects.list(user);
    }

    @Post()
    @Roles(Role.TEACHER)
    create(
        @CurrentUser() user: CurrentUserPayload,
        @Body(new ZodValidationPipe(subjectInputSchema)) body: SubjectInputDto,
    ) {
        return this.subjects.create(user, body);
    }

    @Put(':id')
    @Roles(Role.TEACHER)
    update(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
        @Body(new ZodValidationPipe(subjectInputSchema)) body: SubjectInputDto,
    ) {
        return this.subjects.update(user, params.id, body);
    }

    @Delete(':id')
    @Roles(Role.TEACHER)
    @HttpCode(204)
    remove(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.subjects.remove(user, params.id);
    }

    @Post(':id/enroll')
    @Roles(Role.STUDENT)
    enroll(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.subjects.enroll(user, params.id);
    }

    @Delete(':id/enroll')
    @Roles(Role.STUDENT)
    @HttpCode(204)
    unenroll(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.subjects.unenroll(user, params.id);
    }

    @Get(':id/students')
    @Roles(Role.TEACHER)
    students(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.subjects.students(user, params.id);
    }
}
