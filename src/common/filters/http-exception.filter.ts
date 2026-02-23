import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_ERROR';
        let message: string | string[] = 'Lỗi hệ thống, vui lòng thử lại sau';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const res = exceptionResponse as any;

                // Custom error format từ service (có errorCode)
                if (res.errorCode) {
                    errorCode = res.errorCode;
                    message = res.message;
                }
                // ValidationPipe errors (class-validator)
                else if (Array.isArray(res.message)) {
                    errorCode = 'VALIDATION_ERROR';
                    message = res.message;
                }
                // Default NestJS format
                else {
                    errorCode = this.getDefaultErrorCode(statusCode);
                    message = res.message || exception.message;
                }
            } else {
                errorCode = this.getDefaultErrorCode(statusCode);
                message = exceptionResponse as string;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        response.status(statusCode).json({
            statusCode,
            errorCode,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }

    private getDefaultErrorCode(statusCode: number): string {
        switch (statusCode) {
            case 400: return 'BAD_REQUEST';
            case 401: return 'UNAUTHORIZED';
            case 403: return 'FORBIDDEN';
            case 404: return 'NOT_FOUND';
            case 409: return 'CONFLICT';
            case 422: return 'UNPROCESSABLE_ENTITY';
            case 429: return 'TOO_MANY_REQUESTS';
            default: return 'INTERNAL_ERROR';
        }
    }
}
