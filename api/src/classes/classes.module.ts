import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClassCodeService } from './class-code.service';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [AuthModule],
  controllers: [ClassesController],
  providers: [ClassesService, ClassCodeService],
  exports: [ClassesService],
})
export class ClassesModule {}
