import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReadUserDto } from '../user/read-user.dto';

export class ReadConversationDto {
  @ApiProperty()
  @AutoMap()
  id: number;

  @ApiProperty()
  @AutoMap()
  admin_id: number;

  @ApiProperty()
  @AutoMap()
  type: string;

  @ApiProperty()
  @AutoMap()
  group_name: string;

  @ApiProperty()
  @AutoMap()
  group_image: string;

  @ApiProperty()
  @AutoMap()
  status: string;

  @ApiProperty()
  @AutoMap()
  created_at: Date;

  @ApiProperty()
  @AutoMap()
  updated_at: Date;

  @ApiPropertyOptional({ type: ReadUserDto })
  @AutoMap(() => ReadUserDto)
  admin?: ReadUserDto;
}
