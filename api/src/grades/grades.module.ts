//src/grades/grades.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';

@Module({
    imports: [AuthModule, SubjectsModule],
    controllers: [GradesController],
    providers: [GradesService],
    exports: [GradesService],
})
export class GradesModule {}
