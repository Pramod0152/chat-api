import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReadUserDto } from '../user/read-user.dto';

export class ReadParticipantDto {
  @ApiProperty()
  @AutoMap()
  id: number;

  @ApiProperty()
  @AutoMap()
  conversation_id: number;

  @ApiProperty()
  @AutoMap()
  user_id: number;

  @ApiPropertyOptional()
  @AutoMap()
  last_read_message_id?: number;

  @ApiProperty()
  @AutoMap()
  is_admin: boolean;

  @ApiProperty()
  @AutoMap()
  created_at: Date;

  @ApiProperty()
  @AutoMap()
  updated_at: Date;

  @ApiPropertyOptional({ type: ReadUserDto })
  @AutoMap(() => ReadUserDto)
  user?: ReadUserDto;
}
