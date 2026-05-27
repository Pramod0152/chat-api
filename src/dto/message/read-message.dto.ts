import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReadUserDto } from '../user/read-user.dto';
import { ReadConversationDto } from '../conversation/read-conversation.dto';

export class ReadMessageDto {
  @ApiProperty()
  @AutoMap()
  id: number;

  @ApiProperty()
  @AutoMap()
  conversation_id: number;

  @ApiProperty()
  @AutoMap()
  user_id: number;

  @ApiProperty()
  @AutoMap()
  content: string;

  @ApiProperty()
  @AutoMap()
  is_updated: boolean;

  @ApiProperty()
  @AutoMap()
  type: string;

  @ApiProperty()
  @AutoMap()
  created_at: Date;

  @ApiProperty()
  @AutoMap()
  updated_at: Date;

  @ApiPropertyOptional({ type: ReadConversationDto })
  @AutoMap(() => ReadConversationDto)
  conversation?: ReadConversationDto;

  @ApiPropertyOptional({ type: ReadUserDto })
  @AutoMap(() => ReadUserDto)
  user?: ReadUserDto;
}
