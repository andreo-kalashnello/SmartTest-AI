//src/ai/detect-language.ts
import { LanguageMode } from './dto/generate-questions.dto';

export function resolveTestLanguage(
    mode: LanguageMode,
    inputs: Array<string | undefined>,
) {
    if (mode === 'uk' || mode === 'en') return mode;
    const text = inputs.filter(Boolean).join(' ');
    return /[іїєґІЇЄҐ]/.test(text) ? 'uk' : 'en';
}

export function languageInstruction(language: 'uk' | 'en') {
    return language === 'uk'
        ? 'Write every question and answer option in Ukrainian.'
        : 'Write every question and answer option in English.';
}
