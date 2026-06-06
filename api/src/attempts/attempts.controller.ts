import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { idParamsSchema } from '../tests/dto/test-input.dto';
import { AttemptsService } from './attempts.service';
import { saveAnswersSchema, SaveAnswersDto } from './dto/save-answers.dto';
import { startAttemptSchema, StartAttemptDto } from './dto/start-attempt.dto';

@Controller('public/attempts')
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}

  @Post('start')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @UseGuards(OptionalJwtAuthGuard)
  start(
    @Body(new ZodValidationPipe(startAttemptSchema)) body: StartAttemptDto,
    @CurrentUser() user: CurrentUserPayload | null,
  ) {
    return this.attempts.start(body, user);
  }

  @Patch(':id/answers')
  saveAnswers(
    @Param(new ZodValidationPipe(idParamsSchema)) params: { id: string },
    @Body(new ZodValidationPipe(saveAnswersSchema)) body: SaveAnswersDto,
  ) {
    return this.attempts.saveAnswers(params.id, body);
  }

  @Post(':id/complete')
  complete(@Param(new ZodValidationPipe(idParamsSchema)) params: { id: string }) {
    return this.attempts.complete(params.id);
  }
}
