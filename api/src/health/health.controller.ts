//src/health/health.controller.ts
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import Redis from 'ioredis';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly metrics: MetricsService,
    ) {}

    @Get()
    getHealth() {
        return {
            ok: true,
            service: 'smarttest-api',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('db')
    async getDbHealth() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            this.metrics.setHealthStatus('db', true);
            return {
                ok: true,
                dependency: 'db',
                timestamp: new Date().toISOString(),
            };
        } catch {
            this.metrics.setHealthStatus('db', false);
            throw new ServiceUnavailableException({
                message: 'Database health check failed',
            });
        }
    }

    @Get('redis')
    async getRedisHealth() {
        const redis = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT || 6379),
            lazyConnect: true,
            maxRetriesPerRequest: 0,
            connectTimeout: 2000,
        });

        try {
            await redis.connect();
            const pong = await redis.ping();
            const ok = pong === 'PONG';
            this.metrics.setHealthStatus('redis', ok);
            if (!ok) {
                throw new Error(`Unexpected Redis ping response: ${pong}`);
            }
            return {
                ok: true,
                dependency: 'redis',
                timestamp: new Date().toISOString(),
            };
        } catch {
            this.metrics.setHealthStatus('redis', false);
            throw new ServiceUnavailableException({
                message: 'Redis health check failed',
            });
        } finally {
            redis.disconnect();
        }
    }
}
