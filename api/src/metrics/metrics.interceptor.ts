//src/metrics/metrics.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metrics: MetricsService) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<unknown> {
        const startedAt = process.hrtime.bigint();
        const http = context.switchToHttp();
        const request = http.getRequest<Request>();
        const response = http.getResponse<Response>();
        const method = request.method;
        const route = this.routeLabel(request);

        const durationSeconds = () =>
            Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;

        return next.handle().pipe(
            tap(() => {
                this.metrics.recordHttp(
                    {
                        method,
                        route,
                        statusCode: String(response.statusCode),
                    },
                    durationSeconds(),
                );
            }),
            catchError((error: unknown) => {
                const statusCode = this.errorStatus(error);
                this.metrics.recordHttp(
                    {
                        method,
                        route,
                        statusCode: String(statusCode),
                    },
                    durationSeconds(),
                );
                throw error;
            }),
        );
    }

    private routeLabel(request: Request) {
        const routePath = request.route?.path;
        const baseUrl = request.baseUrl || '';
        if (typeof routePath === 'string')
            return `${baseUrl}${routePath}` || request.path;
        return request.path || 'unknown';
    }

    private errorStatus(error: unknown) {
        if (error && typeof error === 'object' && 'getStatus' in error) {
            const getStatus = (error as { getStatus?: () => number }).getStatus;
            if (typeof getStatus === 'function') return getStatus.call(error);
        }
        return 500;
    }
}
