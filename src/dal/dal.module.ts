import { Global, Module } from '@nestjs/common';
import { UserDataService } from './user.data.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationDataService } from './conversation.data.service';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([User, Conversation])],
  providers: [UserDataService, ConversationDataService],
  exports: [UserDataService, ConversationDataService],
})
export class DalModule {}
