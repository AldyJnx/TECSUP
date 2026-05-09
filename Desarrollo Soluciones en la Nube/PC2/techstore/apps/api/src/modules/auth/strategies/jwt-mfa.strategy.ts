import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface MfaTokenPayload {
  sub: string;
  email: string;
  purpose: 'mfa';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtMfaStrategy extends PassportStrategy(Strategy, 'jwt-mfa') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('mfaToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret') ?? 'dev-secret',
    });
  }

  validate(payload: MfaTokenPayload): MfaTokenPayload {
    return payload;
  }
}
