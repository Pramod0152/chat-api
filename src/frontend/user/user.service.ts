import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/dal/entities/user.entity';
import { UserDataService } from 'src/dal/user.data.service';
import { ReadUserDto } from 'src/dto/user/read-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userDataService: UserDataService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /**
   * Fetch all users.
   * @returns
   */
  async findAll() {
    try {
      const users = await this.userDataService.findAll();

      return this.mapper.mapArrayAsync(users, User, ReadUserDto);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch user by id.
   * @param id
   * @returns
   */
  async findById(id: number) {
    try {
      const user = await this.userDataService.findById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const { password, ...userWithoutPassword } = user.get({ plain: true });

      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
}
