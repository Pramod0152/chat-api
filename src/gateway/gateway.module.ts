import { Global, Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
