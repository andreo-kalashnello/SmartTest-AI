//src/ai/material-extractor.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';

const AI_UPLOAD_MAX_BYTES = Number(
    process.env.AI_UPLOAD_MAX_BYTES || 5 * 1024 * 1024,
);
const AI_ALLOWED_UPLOAD_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
]);

@Injectable()
export class MaterialExtractorService {
    constructor(private readonly openRouter: OpenRouterService) {}

    async extract(file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
    }) {
        if (file.size > AI_UPLOAD_MAX_BYTES) {
            throw new BadRequestException({
                message: `File is too large (max ${Math.round(AI_UPLOAD_MAX_BYTES / 1024 / 1024)} MB)`,
            });
        }
        const mimeType = this.normalizeMime(file.originalname, file.mimetype);
        if (!AI_ALLOWED_UPLOAD_TYPES.has(mimeType)) {
            throw new BadRequestException({
                message: 'Allowed formats: PDF, JPG, PNG, WEBP',
            });
        }

        const text =
            mimeType === 'application/pdf'
                ? await this.extractPdfText(file.buffer)
                : await this.openRouter.extractImageText(file.buffer, mimeType);

        return {
            fileName: file.originalname,
            mimeType,
            text: text.trim(),
        };
    }

    private async extractPdfText(buffer: Buffer): Promise<string> {
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        try {
            const result = await parser.getText();
            return result.text?.trim() ?? '';
        } finally {
            await parser.destroy();
        }
    }

    private normalizeMime(fileName: string, mimeType: string) {
        if (mimeType) return mimeType;
        const name = fileName.toLowerCase();
        if (name.endsWith('.pdf')) return 'application/pdf';
        if (name.endsWith('.png')) return 'image/png';
        if (name.endsWith('.webp')) return 'image/webp';
        if (name.endsWith('.jpg') || name.endsWith('.jpeg'))
            return 'image/jpeg';
        return 'application/octet-stream';
    }
}
