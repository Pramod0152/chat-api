import { UserService } from 'src/bll/user.service';
import { Global, Module } from '@nestjs/common';
import { Profile } from 'src/profile';

@Global()
@Module({
  providers: [UserService, Profile],
  exports: [UserService, Profile],
})
export class ServiceModule {}
