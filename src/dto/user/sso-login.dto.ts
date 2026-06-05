import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SSOLoginDto {
  @ApiProperty()
  sso_token: string;

  @ApiPropertyOptional()
  fcm_token?: string;

  @ApiPropertyOptional()
  device_id: string;

  @ApiPropertyOptional()
  device_type: string;

  @ApiPropertyOptional()
  version?: string;
}
