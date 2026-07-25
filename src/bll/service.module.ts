import { UserService } from 'src/bll/user.service';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { ParticipantService } from './participant.service';
import { Global, Module } from '@nestjs/common';
import { Profile } from 'src/profile';
import { MessageListener } from './listeners/message.listener';
import { AiService } from './ai.service';

@Global()
@Module({
  providers: [
    UserService,
    ConversationService,
    MessageService,
    ParticipantService,
    Profile,
    MessageListener,
    AiService,
  ],
  exports: [UserService, ConversationService, MessageService, ParticipantService, AiService],
})
export class ServiceModule {}
