import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { ParticipantModule } from './participant/participant.module';

@Module({
  imports: [AuthModule, UserModule, ConversationModule, MessageModule, ParticipantModule],
})
export class FrontendModule {}
