import {
  CallHandler,
  ExecutionContext,
  Global,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';
import { createResponseShapeDto } from '../wrappers/response.wrapper';

@Global()
@Injectable()
export class TransformHttpInterceptor
  implements
    NestInterceptor<unknown, ReturnType<typeof createResponseShapeDto>>
{
  private readonly logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const method = request.method;
    const url = request.url;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const calleeName = `${className} ${handlerName}`;

    this.logRequest(method, url, calleeName);

    return next.handle().pipe(
      tap(() => this.logResponse(method, url, response.statusCode, Date.now())),
      map((body: NonNullable<unknown>) =>
        this.transformResponse(body, response, url),
      ),
    );
  }

  private logRequest(method: string, url: string, calleeName: string) {
    this.logger.log(`[Request ${url}]`, calleeName);
  }

  private logResponse(
    method: string,
    url: string,
    statusCode: number,
    startTime: number,
  ) {
    const timeDiff = Date.now() - startTime;
    this.logger.log(
      `${method} ${url} [Response] ${statusCode} ${timeDiff}ms`,
      `${method} ${url}`,
    );
  }

  private transformResponse(
    body: NonNullable<unknown>,
    response: any,
    url: string,
    message?: string,
  ) {
    return {
      body,
      statusCode: response.statusCode,
      timestamp: new Date().toISOString(),
      path: url,
      error: null,
      success: true,
      message: message || null,
    };
  }
}
