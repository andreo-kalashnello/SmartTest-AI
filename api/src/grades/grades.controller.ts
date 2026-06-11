//src/grades/grades.controller.ts
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
import { gradeInputSchema, GradeInputDto } from './dto/grade.dto';
import { GradesService } from './grades.service';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
    constructor(private readonly grades: GradesService) {}

    @Get()
    @Roles(Role.TEACHER)
    listTeacher(@CurrentUser() user: CurrentUserPayload) {
        return this.grades.listTeacherGrades(user);
    }

    @Post()
    @Roles(Role.TEACHER)
    create(
        @CurrentUser() user: CurrentUserPayload,
        @Body(new ZodValidationPipe(gradeInputSchema)) body: GradeInputDto,
    ) {
        return this.grades.create(user, body);
    }

    @Put(':id')
    @Roles(Role.TEACHER)
    update(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
        @Body(new ZodValidationPipe(gradeInputSchema)) body: GradeInputDto,
    ) {
        return this.grades.update(user, params.id, body);
    }

    @Delete(':id')
    @Roles(Role.TEACHER)
    @HttpCode(204)
    remove(
        @CurrentUser() user: CurrentUserPayload,
        @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    ) {
        return this.grades.remove(user, params.id);
    }

    @Get('my')
    @Roles(Role.STUDENT)
    myGrades(@CurrentUser() user: CurrentUserPayload) {
        return this.grades.myGrades(user);
    }
}
