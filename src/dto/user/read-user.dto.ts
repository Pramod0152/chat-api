import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReadUserDto {
  @ApiProperty()
  @AutoMap()
  id: number;

  @ApiProperty()
  @AutoMap()
  username: string;

  @ApiPropertyOptional()
  @AutoMap()
  email?: string;

  @ApiPropertyOptional()
  @AutoMap()
  profile_image?: string;

  @ApiPropertyOptional()
  @AutoMap()
  bio?: string;

  @ApiProperty()
  @AutoMap()
  created_at: Date;

  @ApiProperty()
  @AutoMap()
  updated_at: Date;
}
