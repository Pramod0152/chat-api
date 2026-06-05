import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
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
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { SSOLoginDto } from 'src/dto/user/sso-login.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseHandlerService,
    private readonly firebaseService: FirebaseService,
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
  @ApiConsumes('application/x-www-form-urlencoded')
  async login(@Body() item: LoginDto) {
    const { access_token, refresh_token, user, message } = await this.authService.login(item);
    return this.responseHandler.HandleResponse(
      {
        user,
        access_token,
        refresh_token,
      },
      null,
      message,
    );
  }

  @Post('register')
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
  @ApiConsumes('application/x-www-form-urlencoded')
  async register(@Body() item: RegisterDto) {
    const { access_token, refresh_token, user, message } = await this.authService.register(item);
    return this.responseHandler.HandleResponse(
      {
        access_token,
        refresh_token,
        user,
      },
      null,
      message,
    );
  }

  @Post('sso-login')
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
  @ApiConsumes('application/x-www-form-urlencoded')
  async ssoLogin(@Body() item: SSOLoginDto) {
    const { access_token, refresh_token, user, message } = await this.authService.ssoLogin(item);
    return this.responseHandler.HandleResponse(
      {
        access_token,
        refresh_token,
        user,
      },
      null,
      message,
    );
  }

  @Post('notification')
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
  async sendNotification(@Body() item: any) {
    const response = await this.firebaseService.sendNotification(item);
    return this.responseHandler.HandleResponse(response);
  }
}
