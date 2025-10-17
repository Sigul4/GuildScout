import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Global,
  HttpException,
  HttpStatus,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const isHttpException = (exception: Error): exception is HttpException =>
    exception instanceof HttpException;

const isPrismaError = (error: Error): error is PrismaClientKnownRequestError =>
    error instanceof PrismaClientKnownRequestError;

@Global()
@Catch()
export class AllExceptionsFilter
    extends BaseExceptionFilter
    implements ExceptionFilter
{
  private readonly logger = new Logger();

  constructor(private readonly isDevelopment: boolean) {
    super();
  }

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    if (isPrismaError(exception)) {
      switch (exception.code) {
        case 'P2002': // Unique constraint violation
          exception = new ConflictException('Duplicate entry detected');
          break;
        case 'P2025': // Record not found
          exception = new HttpException('Record not found', HttpStatus.NOT_FOUND);
          break;
        case 'P2003': // Foreign key constraint failure
          exception = new HttpException('Invalid relation', HttpStatus.BAD_REQUEST);
          break;
      }
    }

    const isHttp = isHttpException(exception);

    if (!isHttp) {
      this.logger.error(exception, exception.stack, `Exception ${request.url}`);
    }

    const status = isHttp
        ? (exception as HttpException).getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseContent = (exception as HttpException)?.getResponse?.();
    const isValidationError =
        isHttp &&
        status === HttpStatus.BAD_REQUEST &&
        typeof responseContent === 'object' &&
        'message' in responseContent;

    response.status(status).json({
      statusCode: status,
      path: request.url,
      error: {
        name: exception.name,
        ...(this.isDevelopment && { stack: exception.stack }),
      },
      message: isValidationError
          ? (responseContent as any).message
          : exception.message,
      success: false,
      timestamp: new Date().toISOString(),
      body: null,
    });
  }
}