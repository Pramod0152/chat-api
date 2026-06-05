import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Meta } from './meta.dto';

export class GenericResponseDto<TData> {
  @ApiProperty()
  message?: string;

  @ApiProperty()
  meta?: Meta;

  @ApiProperty()
  data: TData;

  @ApiPropertyOptional({ description: 'Base64-encoded cursor for the next page, or null when there is no next page.' })
  nextCursor?: string | null;
}
