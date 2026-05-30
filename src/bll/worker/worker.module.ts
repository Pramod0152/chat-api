import { Global, Module } from '@nestjs/common';
import { MessageProcessor } from './message.processor';

@Global()
@Module({
  imports: [],
  providers: [MessageProcessor],
})
export class WorkerModule {}
