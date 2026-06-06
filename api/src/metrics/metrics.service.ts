//src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import {
    collectDefaultMetrics,
    Counter,
    Gauge,
    Histogram,
    Registry,
} from 'prom-client';

type HttpLabels = {
    method: string;
    route: string;
    statusCode: string;
};

@Injectable()
export class MetricsService {
    private readonly registry = new Registry();

    private readonly httpRequestsTotal = new Counter({
        name: 'http_requests_total',
        help: 'Total HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.registry],
    });

    private readonly httpRequestDurationSeconds = new Histogram({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry],
    });

    private readonly httpErrorsTotal = new Counter({
        name: 'http_errors_total',
        help: 'Total HTTP error responses',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.registry],
    });

    private readonly aiRequestsTotal = new Counter({
        name: 'ai_requests_total',
        help: 'Total AI requests processed by background jobs',
        labelNames: ['type', 'status'],
        registers: [this.registry],
    });

    private readonly aiRequestDurationSeconds = new Histogram({
        name: 'ai_request_duration_seconds',
        help: 'AI job processing duration in seconds',
        labelNames: ['type', 'status'],
        buckets: [0.5, 1, 2.5, 5, 10, 30, 60, 120, 300],
        registers: [this.registry],
    });

    private readonly aiErrorsTotal = new Counter({
        name: 'ai_errors_total',
        help: 'Total AI job errors',
        labelNames: ['type'],
        registers: [this.registry],
    });

    private readonly aiTokensTotal = new Counter({
        name: 'ai_tokens_total',
        help: 'Total AI tokens reported by provider',
        labelNames: ['type', 'model'],
        registers: [this.registry],
    });

    private readonly aiCostTotal = new Counter({
        name: 'ai_cost_total',
        help: 'Total AI cost reported by provider',
        labelNames: ['type', 'model'],
        registers: [this.registry],
    });

    private readonly testAttemptsStartedTotal = new Counter({
        name: 'test_attempts_started_total',
        help: 'Total started test attempts',
        registers: [this.registry],
    });

    private readonly testAttemptsCompletedTotal = new Counter({
        name: 'test_attempts_completed_total',
        help: 'Total completed test attempts',
        registers: [this.registry],
    });

    private readonly materialExtractErrorsTotal = new Counter({
        name: 'material_extract_errors_total',
        help: 'Total material extraction errors',
        labelNames: ['type'],
        registers: [this.registry],
    });

    private readonly queueJobsTotal = new Counter({
        name: 'queue_jobs_total',
        help: 'Total queue jobs processed',
        labelNames: ['queue', 'type', 'status'],
        registers: [this.registry],
    });

    private readonly queueJobDurationSeconds = new Histogram({
        name: 'queue_job_duration_seconds',
        help: 'Queue job processing duration in seconds',
        labelNames: ['queue', 'type', 'status'],
        buckets: [0.5, 1, 2.5, 5, 10, 30, 60, 120, 300],
        registers: [this.registry],
    });

    private readonly queueFailedJobsTotal = new Counter({
        name: 'queue_failed_jobs_total',
        help: 'Total failed queue jobs',
        labelNames: ['queue', 'type'],
        registers: [this.registry],
    });

    private readonly healthStatus = new Gauge({
        name: 'smarttest_health_status',
        help: 'SmartTest dependency health status, 1 means healthy and 0 means unhealthy',
        labelNames: ['dependency'],
        registers: [this.registry],
    });

    constructor() {
        collectDefaultMetrics({ register: this.registry });
    }

    contentType() {
        return this.registry.contentType;
    }

    metrics() {
        return this.registry.metrics();
    }

    recordHttp(labels: HttpLabels, durationSeconds: number) {
        this.httpRequestsTotal.inc({
            method: labels.method,
            route: labels.route,
            status_code: labels.statusCode,
        });
        this.httpRequestDurationSeconds.observe(
            {
                method: labels.method,
                route: labels.route,
                status_code: labels.statusCode,
            },
            durationSeconds,
        );
        if (Number(labels.statusCode) >= 400) {
            this.httpErrorsTotal.inc({
                method: labels.method,
                route: labels.route,
                status_code: labels.statusCode,
            });
        }
    }

    recordAiJob(
        type: string,
        status: 'completed' | 'failed',
        durationSeconds: number,
    ) {
        this.aiRequestsTotal.inc({ type, status });
        this.aiRequestDurationSeconds.observe(
            { type, status },
            durationSeconds,
        );
        if (status === 'failed') this.aiErrorsTotal.inc({ type });
    }

    recordAiUsage(type: string, model: string | undefined, usage: unknown) {
        const safeModel = model || 'unknown';
        const usageRecord =
            usage && typeof usage === 'object'
                ? (usage as Record<string, unknown>)
                : {};
        const totalTokens = Number(usageRecord.total_tokens ?? 0);
        const cost = Number(usageRecord.cost ?? 0);
        if (Number.isFinite(totalTokens) && totalTokens > 0) {
            this.aiTokensTotal.inc({ type, model: safeModel }, totalTokens);
        }
        if (Number.isFinite(cost) && cost > 0) {
            this.aiCostTotal.inc({ type, model: safeModel }, cost);
        }
    }

    recordAttemptStarted() {
        this.testAttemptsStartedTotal.inc();
    }

    recordAttemptCompleted() {
        this.testAttemptsCompletedTotal.inc();
    }

    recordMaterialExtractError(type: string) {
        this.materialExtractErrorsTotal.inc({ type });
    }

    recordQueueJob(
        queue: string,
        type: string,
        status: 'completed' | 'failed',
        durationSeconds: number,
    ) {
        this.queueJobsTotal.inc({ queue, type, status });
        this.queueJobDurationSeconds.observe(
            { queue, type, status },
            durationSeconds,
        );
        if (status === 'failed') this.queueFailedJobsTotal.inc({ queue, type });
    }

    setHealthStatus(dependency: string, healthy: boolean) {
        this.healthStatus.set({ dependency }, healthy ? 1 : 0);
    }
}
