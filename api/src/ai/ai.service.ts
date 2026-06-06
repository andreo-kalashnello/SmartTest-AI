//src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import { CurrentUserPayload } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { MAX_PIN_CREATE_ATTEMPTS, assertCanRetryPin, isPinUniqueConflict } from '../tests/pin-conflict';
import { PinService } from '../tests/pin.service';
import { serializeTeacherTest, testInclude } from '../tests/test.serializer';
import { resolveTestLanguage } from './detect-language';
import { CreateAiTestDto } from './dto/create-ai-test.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { OpenRouterService } from './openrouter.service';

@Injectable()
export class AiService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pins: PinService,
        private readonly openRouter: OpenRouterService,
    ) {}

    generateQuestions(dto: GenerateQuestionsDto) {
        return this.openRouter.generateQuestions(dto);
    }

    async createTest(user: CurrentUserPayload, dto: CreateAiTestDto) {
        const result = await this.openRouter.generateQuestions({
            ...dto,
            title: dto.title ?? dto.topic,
        });
        const language = resolveTestLanguage(dto.language ?? 'auto', [
            dto.title,
            dto.topic,
            dto.sourceText,
        ]);

        if (!result.ok) {
            return result;
        }

        const test = await this.createTestWithUniquePin(user, dto, result.questions);

        return {
            test: serializeTeacherTest(test),
            model: result.model,
            usage: result.usage,
            language,
        };
    }

    private async createTestWithUniquePin(
        user: CurrentUserPayload,
        dto: CreateAiTestDto,
        questions: Array<{ prompt: string; options: Array<{ text: string; isCorrect: boolean }> }>,
    ) {
        for (let attempt = 0; attempt < MAX_PIN_CREATE_ATTEMPTS; attempt += 1) {
            try {
                return await this.prisma.test.create({
                    data: {
                        title: dto.title ?? dto.topic,
                        pin: this.pins.generatePin(),
                        teacherId: user.id,
                        questions: {
                            create: questions.map((question, questionIndex) => ({
                                prompt: question.prompt,
                                order: questionIndex,
                                options: {
                                    create: question.options.map(
                                        (option, optionIndex) => ({
                                            text: option.text,
                                            isCorrect: option.isCorrect,
                                            order: optionIndex,
                                        }),
                                    ),
                                },
                            })),
                        },
                    },
                    include: testInclude,
                });
            } catch (error) {
                if (!isPinUniqueConflict(error)) throw error;
                assertCanRetryPin(attempt);
            }
        }
        throw new Error('Unable to allocate a unique test PIN');
    }
}
