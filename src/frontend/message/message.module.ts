import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MessageController } from './message.controller';

@Module({
  imports: [AuthModule],
  controllers: [MessageController],
})
export class MessageModule {}
