import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserDataService } from 'src/dal/user.data.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dto/user/login.dto';
import { RegisterDto } from 'src/dto/user/register.dto';
import { ErrorMessageType, SuccessMessageType } from 'src/lib/enums';
import { SSOLoginDto } from 'src/dto/user/sso-login.dto';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { UtilityService } from 'src/services/utility.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userDataServive: UserDataService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly firebaseService: FirebaseService,
    private readonly utilityService: UtilityService,
  ) {}

  async login(item: LoginDto) {
    const user = await this.userDataServive.findByEmail(item.email);
    if (!user) {
      throw new NotFoundException(ErrorMessageType.UserNotFound);
    }

    const passwordMatched = await this.comparePassword(item.password, user.password);
    if (!passwordMatched) {
      throw new BadRequestException(ErrorMessageType.PasswordIncorrect);
    }

    if (item.fcm_token) {
      await this.userDataServive.saveDeviceDetail(user.id, {
        fcm_token: item.fcm_token,
        device_id: item.device_id,
        device_type: item.device_type,
        version: item.version,
      });
    }

    const payload = { sub: user.id };
    const { access_token, refresh_token } = await this.getJwtTokens(payload);

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      user: user,
      message: SuccessMessageType.LoginSuccessMessage,
    };
  }

  private async comparePassword(userPassword: string, dbPassword: string): Promise<boolean> {
    const passwordMatched = await bcrypt.compare(userPassword, dbPassword);

    if (passwordMatched) {
      return true;
    }

    return false;
  }

  async getJwtTokens(payload: any): Promise<any> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('AUTH_JWT_ACCESS_TOKEN_SECRET_KEY'),
        expiresIn: this.configService.get<number>('AUTH_JWT_ACCESS_TOKEN_EXPIRED'),
      }),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('AUTH_JWT_REFRESH_TOKEN_SECRET_KEY'),
        expiresIn: this.configService.get<number>('AUTH_JWT_REFRESH_TOKEN_EXPIRED'),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async register(item: RegisterDto) {
    if (!item.email) {
      throw new BadRequestException(ErrorMessageType.EmailRequired);
    }

    const existUser = await this.userDataServive.findByEmail(item.email);
    if (existUser) {
      throw new BadRequestException(ErrorMessageType.EmailAlreadyExists);
    }

    const usernameExists = await this.userDataServive.checkUsersUsernameAvailable(item.username);
    if (usernameExists) {
      throw new BadRequestException(ErrorMessageType.UsernameAlreadyExists);
    }

    const saltOrRounds = 10;
    item.password = await bcrypt.hash(item.password, saltOrRounds);

    const user = await this.userDataServive.createUser(item);

    if (item.fcm_token) {
      await this.userDataServive.saveDeviceDetail(user.id, {
        fcm_token: item.fcm_token,
        device_id: item.device_id,
        device_type: item.device_type,
        version: item.version,
      });
    }

    const payload = { sub: user.id };
    const { access_token, refresh_token } = await this.getJwtTokens(payload);

    return {
      access_token,
      refresh_token,
      user: user,
      message: SuccessMessageType.RegisterSuccessMessage,
    };
  }

  async refreshTokens(user_id: number): Promise<any> {
    const user = await this.userDataServive.findById(user_id);
    if (!user) {
      throw new UnauthorizedException(ErrorMessageType.Unauthorized);
    }

    const payload = { sub: user.id };
    const { access_token, refresh_token } = await this.getJwtTokens(payload);

    return {
      access_token,
      refresh_token,
      user: user,
      message: SuccessMessageType.RefreshTokenSuccessMessage,
    };
  }

  async ssoLogin(item: SSOLoginDto) {
    const user = await this.firebaseService.verifyUserFromSSO(item.sso_token);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    let existUser = await this.userDataServive.findByEmail(user.email);
    if (!existUser) {
      let username = user.name.split(' ').join('_').toLowerCase();

      const password = await this.utilityService.makeRandomString(10);
      const passwordHash = await bcrypt.hash(password, 10);
      const registerData = {
        username: username,
        email: user.email,
        password: passwordHash,
        profile_image: user.picture,
        bio: '',
        location: '',
      };
      existUser = await this.userDataServive.ssoUser(registerData);
    }

    const payload = { sub: existUser.id };
    const { access_token, refresh_token } = await this.getJwtTokens(payload);
    return {
      access_token,
      refresh_token,
      user: existUser,
      message: 'SSO Login Success',
    };
  }
}
