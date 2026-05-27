import { UserService } from 'src/bll/user.service';
import { ConversationService } from './conversation.service';
import { MessageService } from './message.service';
import { Global, Module } from '@nestjs/common';
import { Profile } from 'src/profile';

@Global()
@Module({
  providers: [UserService, ConversationService, MessageService, Profile],
  exports: [UserService, ConversationService, MessageService],
})
export class ServiceModule {}
