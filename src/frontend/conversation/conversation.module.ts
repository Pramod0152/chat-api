import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ConversationController } from './conversation.controller';

@Module({
  imports: [AuthModule],
  controllers: [ConversationController],
})
export class ConversationModule {}
