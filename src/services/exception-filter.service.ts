import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger';
import { EnvVariableType, ErrorMessageType, SeverityType, ErrorCodeType } from 'src/lib/enums';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { Meta } from 'src/dto/meta.dto';

@Catch()
export class ExceptionsFilterService implements ExceptionFilter {
  constructor(
    private logger: LoggerService,
    private configService: ConfigService,
  ) {}

  /**
   * Catch All the exceptions.
   * @param exception
   * @param host
   */
  catch(exception: Error, host: ArgumentsHost) {
    /** Get the response and request object of the expressjs from the context */
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    /** Return terminus error as it is. */
    if (exception.name == 'ServiceUnavailableException') {
      return response.status(this.getStatusCode(exception)).json(exception);
    }

    /** Create error res object. */
    const res: GenericResponseDto<any> = { message: '', data: {}, meta: new Meta({}) };
    res.message = exception.message || ErrorMessageType.DefaultErrorMessage;
    res.meta.path = request.url || '';
    res.meta.method = request.method || '';
    res.meta.timestamp = new Date();
    res.meta.httpStatusCode = this.getStatusCode(exception);
    res.meta.code = ErrorCodeType.GeneralException;
    res.meta.severity = SeverityType.error;
    res.meta.stack = exception.stack || null;
    /** In case of httpException */
    if (exception instanceof HttpException) {
      const excep = exception.getResponse();
      res.message = (excep as any).message || exception.message;
      res.meta.code = (excep as any).code || ErrorCodeType.GeneralException;
      res.meta.severity = (excep as any).severity || SeverityType.error;
    }

    /** Log the error with application_id*/
    const errorLog = this.getErrorLog(res);
    this.logger.error(`👿👿 👿👿 ${errorLog}`);

    /** If error is critical, log as critical, with application ID */
    if (this.isCritical(res)) {
      this.logger.crit(`👿👿 👿👿 ${errorLog}`);
    }

    /** If env is not loc */
    const env: string = this.configService.get<string>('NODE_ENV');
    if (env == EnvVariableType.PROD) {
      /** Remove sensitive info and return error. */
      delete res.meta.path;
      delete res.meta.method;
      delete res.meta.timestamp;
      delete res.meta.severity;
      delete res.meta.stack;
      /** If httpStatusCode is 500 change error message as 'Internal Server Error'*/
      if (res.meta && res.meta.httpStatusCode == HttpStatus.INTERNAL_SERVER_ERROR) {
        res.message = ErrorMessageType.DefaultErrorMessage;
      }
    }
    return response.status(res.meta.httpStatusCode).json(res);
  }

  /**
   * Define custome critical condition
   * @param errorResponse
   * @returns
   */
  private isCritical(errorResponse: GenericResponseDto<any>): boolean {
    /** 1- If error is type of 500 it is critical */
    if (errorResponse.meta && errorResponse.meta.httpStatusCode == HttpStatus.INTERNAL_SERVER_ERROR) {
      return true;
    }
    /** 2- If the sevrity level is less then 3 (ie: emerg = 0, alert = 1, crit = 2)  */
    if (errorResponse.meta && errorResponse.meta.severity < 3) {
      return true;
    }

    return false;
  }

  private getStatusCode(exception: unknown): number {
    return exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Returns string for the log.
   * @param errorResponse
   * @returns
   */
  private getErrorLog(errorResponse: GenericResponseDto<any>): string {
    const message: string = errorResponse.message;
    const { httpStatusCode, method, path, stack } = errorResponse.meta;

    const errorLog = ` : 🔥 🔥  ${errorResponse.message}  🔥 🔥 \n 
            RESPONSE CODE: ${httpStatusCode}  METHOD: ${method}   URL: ${path} \n
            Stack: ${stack ? stack : message}
        `;
    return errorLog;
  }
}
