import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @ApiPropertyOptional({ description: 'Updated message text or payload content' })
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Updated message type' })
  @IsOptional()
  type?: string;
}
