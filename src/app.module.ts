import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './services/sequelize-config.service';
import { DalModule } from './dal/dal.module';
import { LoggerModule } from './common/logger/logger.module';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionsFilterService } from './services/exception-filter.service';
import { FrontendModule } from './frontend/frontend.module';
import { ResponseModule } from './common/response/response.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    DalModule,
    LoggerModule,
    ResponseModule,
    GatewayModule,
    FrontendModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [
    ConfigService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilterService,
    },
  ],
})
export class AppModule {}
