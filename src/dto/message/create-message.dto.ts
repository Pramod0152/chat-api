import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Conversation id where message belongs' })
  conversation_id: number;

  @ApiProperty({ description: 'Message text or payload content' })
  content: string;

  @ApiPropertyOptional({ description: 'Message type' })
  @IsOptional()
  type?: string;
}
