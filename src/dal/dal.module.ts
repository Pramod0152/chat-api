import { Global, Module } from '@nestjs/common';
import { UserDataService } from './user.data.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UserDataService],
  exports: [UserDataService],
})
export class DalModule {}
