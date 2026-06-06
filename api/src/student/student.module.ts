import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClassesModule } from '../classes/classes.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';

@Module({
  imports: [AuthModule, ClassesModule],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
