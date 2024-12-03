import { LoggerService } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class CustomLogger implements LoggerService {
  constructor(@InjectPinoLogger() private readonly logger: PinoLogger) {}

  log(message: any, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: any, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug?(message: any, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose?(message: any, context?: string) {
    this.logger.trace({ context }, message);
  }

  fatal?(message: any, context?: string) {
    this.logger.fatal({ context }, message);
  }
}
