import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [],
})
export class AiModule { }
