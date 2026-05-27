import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserDataService } from 'src/dal/user.data.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly userDataService: UserDataService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_JWT_ACCESS_TOKEN_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(_req: any, payload: any) {
    const user = await this.userDataService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: payload.sub };
  }
}
