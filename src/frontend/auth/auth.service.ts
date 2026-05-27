import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDataService } from 'src/dal/user.data.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dto/user/login.dto';
import { RegisterDto } from 'src/dto/user/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userDataServive: UserDataService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user and return tokens.
   * @param data: LoginDto
   * @returns
   */
  async login(item: LoginDto) {
    try {
      const user = await this.userDataServive.findByEmail(item.email);
      if (!user) {
        throw new HttpException('Authentication failed', HttpStatus.NOT_FOUND);
      }

      const passwordMatched = await this.comparePassword(item.password, user.password);
      if (!passwordMatched) {
        throw new HttpException('Authentication failed', HttpStatus.NOT_FOUND);
      }

      const payload = { sub: user.id };
      const { access_token, refresh_token } = await this.getJwtTokens(payload);

      return {
        access_token: access_token,
        refresh_token: refresh_token,
        user: user,
        message: 'Login Successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Compare password.
   * @param userPassword - password from the req.body.
   * @param dbPassword  - password form the user table.
   * @returns  - True if password match,
   */
  private async comparePassword(userPassword: string, dbPassword: string): Promise<boolean> {
    try {
      const passwordMatched = await bcrypt.compare(userPassword, dbPassword);

      if (passwordMatched) {
        return true;
      }

      return false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create and return refresh token.
   * @param payload
   * @returns
   */
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

  /**
   * Register user.
   * @param data: RegisterDto
   * @returns
   */
  async register(item: RegisterDto) {
    try {
      if (!item.email) {
        throw new BadRequestException('Email is required');
      }

      const existUser = await this.userDataServive.findByEmail(item.email);
      if (existUser) {
        throw new BadRequestException('Email already exists');
      }

      const usernameExists = await this.userDataServive.checkUsersUsernameAvailable(item.username);
      if (usernameExists) {
        throw new BadRequestException('Username already exists');
      }

      const saltOrRounds = 10;
      item.password = await bcrypt.hash(item.password, saltOrRounds);

      const user = await this.userDataServive.createUser(item);

      const payload = { sub: user.id };
      const { access_token, refresh_token } = await this.getJwtTokens(payload);

      return {
        access_token,
        refresh_token,
        user: user,
        message: 'Register Successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create, save and return refresh and access token.
   * @param user_id
   * @returns
   */
  async refreshTokens(user_id: number): Promise<any> {
    try {
      const user = await this.userDataServive.findById(user_id);
      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }

      const payload = { sub: user.id };
      const { access_token, refresh_token } = await this.getJwtTokens(payload);

      return {
        access_token,
        refresh_token,
        user: user,
        message: 'Refresh Token Successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
