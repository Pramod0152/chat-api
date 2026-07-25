import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from 'src/bll/ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule { }
