import { UserService } from 'src/bll/user.service';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { ParticipantService } from './participant.service';
import { Global, Module } from '@nestjs/common';
import { Profile } from 'src/profile';

@Global()
@Module({
  providers: [UserService, ConversationService, MessageService, ParticipantService, Profile],
  exports: [UserService, ConversationService, MessageService, ParticipantService],
})
export class ServiceModule {}
