import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ParticipantController } from './participant.controller';

@Module({
  imports: [AuthModule],
  controllers: [ParticipantController],
})
export class ParticipantModule {}
