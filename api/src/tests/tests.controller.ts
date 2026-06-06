import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { idParamsSchema, testInputSchema, TestInputDto } from './dto/test-input.dto';
import { TestsService } from './tests.service';

@Controller('tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TEACHER)
export class TestsController {
  constructor(private readonly tests: TestsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.tests.list(user);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(testInputSchema)) body: TestInputDto,
  ) {
    return this.tests.create(user, body);
  }

  @Get(':id')
  get(@CurrentUser() user: CurrentUserPayload, @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.tests.get(user, params.id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    @Body(new ZodValidationPipe(testInputSchema)) body: TestInputDto,
  ) {
    return this.tests.update(user, params.id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: CurrentUserPayload, @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.tests.remove(user, params.id);
  }

  @Get(':id/attempts')
  attempts(@CurrentUser() user: CurrentUserPayload, @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.tests.attempts(user, params.id);
  }
}
