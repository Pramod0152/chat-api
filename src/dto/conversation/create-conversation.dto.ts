import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ConversationType } from 'src/lib/enums';

export class CreateConversationDto {
  @ApiProperty({ enum: ConversationType, description: 'Conversation type' })
  type: ConversationType;

  @ApiPropertyOptional({ description: 'Group name for group conversations' })
  @IsOptional()
  group_name?: string;

  @ApiPropertyOptional({ description: 'Group image URL for group conversations' })
  @IsOptional()
  group_image?: string;
}
