//src/common/middleware/request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

export type RequestWithId = Request & {
    id?: string;
};

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(request: RequestWithId, response: Response, next: NextFunction) {
        const incoming = request.header(REQUEST_ID_HEADER);
        const existingResponseHeader = response.getHeader(REQUEST_ID_HEADER);
        const existing =
            typeof existingResponseHeader === 'string'
                ? existingResponseHeader
                : undefined;
        const requestId = incoming?.trim() || existing || randomUUID();
        request.id = requestId;
        response.setHeader(REQUEST_ID_HEADER, requestId);
        next();
    }
}
