import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { PinService } from './pin.service';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  imports: [AuthModule, SubjectsModule],
  controllers: [TestsController],
  providers: [TestsService, PinService],
  exports: [TestsService, PinService],
})
export class TestsModule {}
