import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

export class LoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiPropertyOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  fcm_token?: string;

  @ApiPropertyOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  device_id: string;

  @ApiPropertyOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  device_type: string;

  @ApiPropertyOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  version?: string;
}
