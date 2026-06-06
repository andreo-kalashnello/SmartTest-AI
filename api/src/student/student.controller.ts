import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, CurrentUserPayload } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { StudentService } from './student.service';

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT)
export class StudentController {
  constructor(private readonly student: StudentService) {}

  @Get('attempts')
  attempts(@CurrentUser() user: CurrentUserPayload) {
    return this.student.attempts(user);
  }

  @Get('classes')
  classes(@CurrentUser() user: CurrentUserPayload) {
    return this.student.classesFor(user);
  }
}
