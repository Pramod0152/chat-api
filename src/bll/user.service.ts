import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

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
}
