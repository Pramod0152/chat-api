import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class FilterMessageDto {
  @ApiProperty({ description: 'Conversation ID.' })
  conversation_id: number;

  @ApiPropertyOptional({ description: 'Base64-encoded cursor from a previous response nextCursor.' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value ? parseInt(Buffer.from(String(value), 'base64').toString('ascii'), 10) : null,
  )
  cursor?: string | null;

  @ApiPropertyOptional({ description: 'Limit of the data. Defaults to 10 in the data layer when omitted.' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => parseInt(value, 10))
  limit?: number | null;
}
