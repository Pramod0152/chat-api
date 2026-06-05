import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserDeviceDetail } from './entities/user-device-detail.entity';
import { RegisterDto } from 'src/dto/user/register.dto';
import { Op } from 'sequelize';
import { PaginationDto } from 'src/dto/pagination.dto';
import { paginate } from 'src/common/pagination/paginate';

export type SaveUserDeviceDetailInput = {
  device_id?: string;
  device_type?: string;
  version?: string;
  fcm_token: string;
};

@Injectable()
export class UserDataService {
  constructor(
    @InjectModel(User) private readonly model: typeof User,
    @InjectModel(UserDeviceDetail) private readonly userDeviceDetailModel: typeof UserDeviceDetail,
  ) {}

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

  async ssoUser(item: any) {
    return this.model.create(item);
  }

  async updateUser(user_id: any, item: any) {
    const user = await this.findById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const filtereditem = Object.fromEntries(Object.entries(item).filter(([_, value]) => value !== undefined));
    return user.update(filtereditem);
  }

  async findAll(query: PaginationDto) {
    const { limit = 10, cursor } = query;
    const condition: any = {};

    if (cursor != null) {
      condition.id = { [Op.lt]: cursor };
    }

    const users = await this.model.findAll({
      where: condition,
      limit: limit + 1,
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });

    return paginate(users, limit);
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

  async saveDeviceDetail(userId: number, item: SaveUserDeviceDetailInput) {
    const deviceType = item.device_type || 'web';

    await this.userDeviceDetailModel.update(
      { status: 0 },
      {
        where: {
          user_id: userId,
          device_type: deviceType,
          status: 1,
        },
      },
    );

    return this.userDeviceDetailModel.create({
      user_id: userId,
      device_type: deviceType,
      device_id: item.device_id ?? null,
      version: item.version ?? null,
      fcm_token: item.fcm_token,
      status: 1,
    });
  }

  async findAllTokens(userId: number) {
    return this.userDeviceDetailModel.findAll({
      where: {
        user_id: userId,
        status: 1,
        deleted_at: null,
        fcm_token: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] },
      },
    });
  }
}
