import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateConversationDto {
  @ApiPropertyOptional({ description: 'Group name for group conversations' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  group_name?: string;

  @ApiPropertyOptional({ description: 'Group image URL for group conversations' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  group_image?: string;
}
