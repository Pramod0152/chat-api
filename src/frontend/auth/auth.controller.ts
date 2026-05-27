import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GenericResponseDto } from 'src/dto/generic-response.dto';
import { LoginDto } from 'src/dto/user/login.dto';
import { RegisterDto } from 'src/dto/user/register.dto';
import { ResponseHandlerService } from 'src/common/response/response-handler.service';
import { IsPublic } from 'src/common/decorators/is-public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseHandlerService,
  ) {}

  @Post('login')
  @IsPublic()
  @ApiNotFoundResponse({
    type: GenericResponseDto,
    description: 'Record Not Found!.',
  })
  @ApiBadRequestResponse({
    type: GenericResponseDto,
    description: 'Form Validation Error!. ',
  })
  @ApiUnauthorizedResponse({
    type: GenericResponseDto,
    description: 'Unauthorized!. ',
  })
  async login(@Body() item: LoginDto) {
    const { access_token, refresh_token, user, message } = await this.authService.login(item);
    return this.responseHandler.HandleResponse(
      {
        user,
        access_token,
        refresh_token,
      },
      message,
    );
  }

  @Post('register')
  @ApiNotFoundResponse({
    type: GenericResponseDto,
    description: 'Record Not Found!.',
  })
  @ApiBadRequestResponse({
    type: GenericResponseDto,
    description: 'Form Validation Error!. ',
  })
  @ApiUnauthorizedResponse({
    type: GenericResponseDto,
    description: 'Unauthorized!. ',
  })
  async register(@Body() item: RegisterDto) {
    const { access_token, refresh_token, user, message } = await this.authService.register(item);
    return this.responseHandler.HandleResponse(
      {
        access_token,
        refresh_token,
        user,
      },
      message,
    );
  }
}
