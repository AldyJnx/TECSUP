import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export interface MfaSetupResult {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

@Injectable()
export class MfaService {
  constructor(private readonly config: ConfigService) {}

  async generateSecret(email: string): Promise<MfaSetupResult> {
    const issuer = this.config.get<string>('mfa.issuer') ?? 'TechStore';
    const secret = speakeasy.generateSecret({
      name: `${issuer}:${email}`,
      issuer,
      length: 20,
    });

    const otpauthUrl = secret.otpauth_url ?? '';
    const qrDataUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret: secret.base32,
      otpauthUrl,
      qrDataUrl,
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
