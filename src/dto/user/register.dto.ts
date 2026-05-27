import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

export class RegisterDto {
  @ApiProperty()
  @Transform(({ value }: { value: string }) => value?.trim())
  username: string;

  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  email: string;

  @ApiProperty()
  @Transform(({ value }: { value: string }) => value?.trim())
  password: string;

  @ApiPropertyOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  profile_image: string;

  @ApiPropertyOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  bio: string;

  @ApiPropertyOptional()
  @Transform(({ value }: { value: string }) => value?.trim())
  location: string;
}
