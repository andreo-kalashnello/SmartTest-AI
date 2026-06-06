import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { idParamsSchema } from '../tests/dto/test-input.dto';
import { ClassesService } from './classes.service';
import { createClassSchema, CreateClassDto, joinClassSchema, JoinClassDto } from './dto/class-input.dto';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get()
  @Roles(Role.TEACHER)
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.classes.listTeacherClasses(user);
  }

  @Post()
  @Roles(Role.TEACHER)
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createClassSchema)) body: CreateClassDto,
  ) {
    return this.classes.create(user, body);
  }

  @Post('join')
  @Roles(Role.STUDENT)
  join(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(joinClassSchema)) body: JoinClassDto,
  ) {
    return this.classes.join(user, body);
  }

  @Get(':id/members')
  @Roles(Role.TEACHER)
  members(@CurrentUser() user: CurrentUserPayload, @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.classes.members(user, params.id);
  }

  @Post(':id/regenerate-code')
  @Roles(Role.TEACHER)
  regenerateCode(@CurrentUser() user: CurrentUserPayload, @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.classes.regenerateCode(user, params.id);
  }

  @Delete(':id/leave')
  @Roles(Role.STUDENT)
  @HttpCode(204)
  leave(@CurrentUser() user: CurrentUserPayload, @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.classes.leave(user, params.id);
  }
}
