//src/homework/homework.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { HomeworkController } from './homework.controller';
import { HomeworkService } from './homework.service';

@Module({
    imports: [AuthModule, SubjectsModule],
    controllers: [HomeworkController],
    providers: [HomeworkService],
    exports: [HomeworkService],
})
export class HomeworkModule {}
