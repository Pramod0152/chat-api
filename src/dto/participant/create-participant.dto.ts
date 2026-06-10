import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateParticipantDto {
  @ApiProperty()
  conversation_id: number;

  @ApiProperty()
  user_ids: number[];
}
