import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateParticipantDto {
  @ApiPropertyOptional()
  @IsOptional()
  last_read_message_id?: number;
}
