import { Module } from '@nestjs/common';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeConfigService } from './services/sequelize-config.service';
import { DalModule } from './dal/dal.module';
import { LoggerModule } from './common/logger/logger.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ExceptionsFilterService } from './services/exception-filter.service';
import { FrontendModule } from './frontend/frontend.module';
import { ResponseModule } from './common/response/response.module';
import { PassportModule } from '@nestjs/passport';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ServiceModule } from './bll/service.module';
import { BullModule } from '@nestjs/bullmq';
import { BullQueueModule } from './bull-queue.module';
import { WorkerModule } from './bll/worker/worker.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseModule } from './common/firebase/firebase.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullQueueModule,
    FirebaseModule,
    DalModule,
    ServiceModule,
    LoggerModule,
    ResponseModule,
    GatewayModule,
    FrontendModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 2000,
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SequelizeModule.forRootAsync({
      useClass: SequelizeConfigService,
    }),
  ],
  controllers: [],
  providers: [
    ConfigService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilterService,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
