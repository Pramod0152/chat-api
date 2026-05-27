import { UserService } from 'src/bll/user.service';
import { ConversationService } from './conversation.service';
import { Global, Module } from '@nestjs/common';
import { Profile } from 'src/profile';

@Global()
@Module({
  providers: [UserService, ConversationService, Profile],
  exports: [UserService, ConversationService],
})
export class ServiceModule {}
