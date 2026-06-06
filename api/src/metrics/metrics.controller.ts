//src/metrics/metrics.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metrics: MetricsService) {}

    @Get()
    async getMetrics(@Res() response: Response) {
        response.setHeader('Content-Type', this.metrics.contentType());
        response.send(await this.metrics.metrics());
    }
}
