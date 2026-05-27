import { Module } from '@nestjs/common';
import { AuthModule } from 'src/frontend/auth/auth.module';
import { GatewayService } from './gateway.service';

@Module({
  imports: [AuthModule],
  providers: [GatewayService],
})
export class GatewayModule {}
