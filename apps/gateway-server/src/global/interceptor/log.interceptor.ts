import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, body, query, params } = req;
    const ip = req.headers['x-forwarded-for'] || req.ip;

    const now = Date.now();

    return next.handle().pipe(
      tap((res) => {
        const duration = Date.now() - now;
        this.logger.log(
          `${method} ${originalUrl} [${duration}ms] ip=${ip} query=${JSON.stringify(query)} params=${JSON.stringify(params)} body=${JSON.stringify(body)}`,
        );
      }),
      catchError((err) => {
        const delay = Date.now() - now;
        this.logger.error(
          `${method} ${originalUrl} [${delay}ms] ip=${ip} ERROR: ${err.message}`,
        );
        throw err;
      }),
    );
  }
}
