import { ConfigService } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './common/logger/logger';
import { EnvVariableType } from './lib/enums';
import { GenericResponseDto } from './dto/generic-response.dto';

export default async function (app: NestApplication) {
  const logger: LoggerService = app.get<LoggerService>(LoggerService);

  /** xtract documentation variables. */
  const configService = app.get(ConfigService);

  const env: string = configService.get<string>('NODE_ENV');
  const docName: string = configService.get<string>('DOC_NAME');
  const docDesc: string = configService.get<string>('DOC_DESC');
  const docVersion: string = configService.get<string>('DOC_VERSION');
  const docPrefix: string = configService.get<string>('DOC_PREFIX');
  const httpHost: string = configService.get<string>('HTTP_HOST');
  const httpPort: string = configService.get<string>('HTTP_PORT');

  /** Create swagger documentation in all env except the production. */
  if (env !== EnvVariableType.PROD) {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle(docName)
      .setDescription(docDesc)
      .setVersion(docVersion)
      .addTag('API')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [GenericResponseDto],
      deepScanRoutes: true,
    });
    SwaggerModule.setup(docPrefix, app, document);
    logger.info(`📜 📜 📜 Find swagger documentation on ${httpHost}:${httpPort}/${docPrefix} 📜 📜 📜`);
  }
}
