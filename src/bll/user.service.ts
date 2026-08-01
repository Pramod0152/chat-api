import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationDataService } from 'src/dal/conversation.data.service';
import { User } from 'src/dal/entities/user.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { ReadUserDto } from 'src/dto/user/read-user.dto';
import { ErrorMessageType } from 'src/lib/enums';

@Injectable()
export class UserService {
  constructor(
    private readonly userDataService: UserDataService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly conversationDataService: ConversationDataService,
  ) { }

  async findAll(query: PaginationDto) {
    const { data, nextCursor } = await this.userDataService.findAll(query);
    return {
      data: await this.mapper.mapArrayAsync(data, User, ReadUserDto),
      nextCursor,
    };
  }

  async findById(user_id: number) {
    const user = await this.userDataService.findById(user_id);
    if (!user) {
      throw new NotFoundException(ErrorMessageType.UserNotFound);
    }

    return this.mapper.map(user, User, ReadUserDto);
  }

  async findUsersNotInPrivateConversation(user_id: number, query: PaginationDto) {
    const { data, nextCursor } = await this.userDataService.findUsersNotInPrivateConversation(user_id, query);
    return {
      data: await this.mapper.mapArrayAsync(data, User, ReadUserDto),
      nextCursor,
    };
  }

  async findUsersNotInGroupConversation(conversation_id: number, query: PaginationDto, user_id: number) {
    const conversation = await this.conversationDataService.findById(conversation_id);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.admin_id !== user_id) {
      throw new NotFoundException('Not Authorized to view users of this conversation');
    }

    const { data, nextCursor } = await this.userDataService.findUsersNotInGroupConversation(conversation_id, query);
    return {
      data: await this.mapper.mapArrayAsync(data, User, ReadUserDto),
      nextCursor,
    };
  }
}
