import { Global, Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { MessageProcessor } from './message.processor';

@Global()
@Module({
  imports: [GatewayModule],
  providers: [MessageProcessor],
  exports: [MessageProcessor],
})
export class WorkerModule {}
