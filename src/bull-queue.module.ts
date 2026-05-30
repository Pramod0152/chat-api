import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'message-queue',
    }),
  ],
  exports: [BullModule],
})
export class BullQueueModule {}
