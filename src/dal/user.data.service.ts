import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { RegisterDto } from 'src/dto/user/register.dto';

@Injectable()
export class UserDataService {
  constructor(@InjectModel(User) private readonly model: typeof User) {}

  async createUser(user: RegisterDto) {
    return this.model.create({
      username: user.username,
      email: user.email,
      password: user.password,
      profile_image: user.profile_image,
      bio: user.bio,
      location: user.location,
    });
  }

  async updateUser(user_id: any, item: any) {
    const user = await this.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const filtereditem = Object.fromEntries(Object.entries(item).filter(([_, value]) => value !== undefined));
    return user.update(filtereditem);
  }

  async findAll() {
    return this.model.findAll({
      attributes: { exclude: ['password'] },
    });
  }

  async findById(user_id: any) {
    return this.model.findOne({
      where: {
        id: user_id,
      },
    });
  }

  async findByEmail(email: any) {
    return this.model.findOne({
      where: {
        email: email,
      },
    });
  }

  async findByUsername(username: any) {
    return this.model.findOne({
      where: {
        username: username,
      },
    });
  }

  async updatePassword(user_id: any, password: string) {
    return this.model.update(
      {
        password: password,
      },
      {
        where: { id: user_id },
      },
    );
  }

  async checkUsersUsernameAvailable(username: any) {
    return this.model.findOne({
      where: {
        username: username,
      },
    });
  }
}
