import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Profile } from 'src/profile';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, Profile],
  exports: [UserService],
})
export class UserModule {}
