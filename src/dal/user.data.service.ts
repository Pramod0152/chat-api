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

  async updateUser(id: any, item: any) {
    const user = await this.findById(id);
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

  async findById(id: any) {
    return this.model.findOne({
      where: {
        id,
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

  async updatePassword(id: any, password: string) {
    return this.model.update(
      {
        password: password,
      },
      {
        where: { id: id },
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
