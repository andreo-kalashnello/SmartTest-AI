//src/homework/homework.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Response } from 'express';
import {
    CurrentUser,
    CurrentUserPayload,
} from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { idParamsSchema } from '../tests/dto/test-input.dto';
import {
    homeworkInputSchema,
    HomeworkInputDto,
    homeworkSubmitSchema,
    HomeworkSubmitDto,
    UploadedHomeworkFile,
} from './dto/homework.dto';
import { HomeworkService } from './homework.service';

@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
    constructor(private readonly homework: HomeworkService) {}

    @Get()
    @Roles(Role.TEACHER)
    listTeacher(@CurrentUser() user: CurrentUserPayload) {
        return this.homework.listTeacherHomework(user);
    }

    @Post()
    @Roles(Role.TEACHER)
    create(
        @CurrentUser() user: CurrentUserPayload,
        @Body(new ZodValidationPipe(homeworkInputSchema))
        body: HomeworkInputDto,
    ) {
        return this.homework.create(user, body);
    }

    @Put(':id')
    @Roles(Role.TEACHER)
    update(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
        @Body(new ZodValidationPipe(homeworkInputSchema))
        body: HomeworkInputDto,
    ) {
        return this.homework.update(user, params.id, body);
    }

    @Delete(':id')
    @Roles(Role.TEACHER)
    @HttpCode(204)
    remove(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.homework.remove(user, params.id);
    }

    @Post(':id/attachment')
    @Roles(Role.TEACHER)
    @UseInterceptors(FileInterceptor('file'))
    uploadAttachment(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
        @UploadedFile() file: UploadedHomeworkFile | undefined,
    ) {
        return this.homework.uploadAttachment(user, params.id, file);
    }

    @Delete(':id/attachment')
    @Roles(Role.TEACHER)
    @HttpCode(204)
    removeAttachment(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.homework.removeAttachment(user, params.id);
    }

    @Get(':id/attachment')
    @Roles(Role.TEACHER, Role.STUDENT)
    async downloadAttachment(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
        @Res() response: Response,
    ) {
        const file = await this.homework.downloadAttachment(user, params.id);
        response.setHeader('Content-Type', file.mimeType);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`);
        response.send(file.data);
    }

    @Get('student')
    @Roles(Role.STUDENT)
    listStudent(@CurrentUser() user: CurrentUserPayload) {
        return this.homework.listStudentHomework(user);
    }

    @Post(':id/submit')
    @Roles(Role.STUDENT)
    @UseInterceptors(FileInterceptor('file'))
    submit(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
        @Body(new ZodValidationPipe(homeworkSubmitSchema))
        body: HomeworkSubmitDto,
        @UploadedFile() file: UploadedHomeworkFile | undefined,
    ) {
        return this.homework.submit(user, params.id, body, file);
    }

    @Get(':id/submissions')
    @Roles(Role.TEACHER)
    submissions(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.homework.submissions(user, params.id);
    }

    @Get(':id/submissions/:submissionId/attachment')
    @Roles(Role.TEACHER, Role.STUDENT)
    async downloadSubmissionAttachment(
        @CurrentUser() user: CurrentUserPayload,
        @Param('id') homeworkId: string,
        @Param('submissionId') submissionId: string,
        @Res() response: Response,
    ) {
        const file = await this.homework.downloadSubmissionAttachment(user, homeworkId, submissionId);
        response.setHeader('Content-Type', file.mimeType);
        response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`);
        response.send(file.data);
    }
}
