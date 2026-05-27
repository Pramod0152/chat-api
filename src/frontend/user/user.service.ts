import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserDataService } from 'src/dal/user.data.service';

@Injectable()
export class UserService {
  constructor(private readonly userDataService: UserDataService) {}

  /**
   * Fetch all users.
   * @returns
   */
  async findAll() {
    try {
      const users = await this.userDataService.findAll();

      return users;
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
