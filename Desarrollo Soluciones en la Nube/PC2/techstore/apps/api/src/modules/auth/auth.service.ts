import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma, RoleEnum, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MfaService } from './mfa.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, JwtPayload } from '../../common/types';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const MFA_TOKEN_TTL_SECONDS = 300;
const MAX_MFA_ATTEMPTS = 3;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResult {
  mfaRequired?: boolean;
  mfaToken?: string;
  tokens?: AuthTokens;
  user?: AuthenticatedUser;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mfa: MfaService,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (dto.storeId) {
      const store = await this.prisma.store.findUnique({ where: { id: dto.storeId } });
      if (!store || !store.isActive) {
        throw new BadRequestException('Invalid storeId');
      }
    }

    const rounds = this.config.get<number>('bcrypt.rounds') ?? 12;
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const employeeRole = await this.prisma.role.findUnique({
      where: { name: RoleEnum.EMPLOYEE },
    });

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          fullName: dto.fullName,
          storeId: dto.storeId,
        },
      });
      if (employeeRole) {
        await tx.userRole.create({
          data: {
            userId: created.id,
            roleId: employeeRole.id,
            assignedById: created.id,
          },
        });
      }
      return created;
    });

    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { userRoles: { include: { role: true } } },
    });

    const genericError = new UnauthorizedException('Invalid credentials');

    if (!user || !user.isActive || user.deletedAt) {
      throw genericError;
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account is locked. Try again later.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.handleFailedLogin(user);
      throw genericError;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    if (user.mfaEnabled) {
      const mfaToken = this.jwt.sign(
        { sub: user.id, email: user.email, purpose: 'mfa' },
        {
          secret: this.config.get<string>('jwt.accessSecret'),
          expiresIn: MFA_TOKEN_TTL_SECONDS,
        },
      );

      await this.prisma.mfaCode.create({
        data: {
          userId: user.id,
          codeHash: crypto.createHash('sha256').update(mfaToken).digest('hex'),
          expiresAt: new Date(Date.now() + MFA_TOKEN_TTL_SECONDS * 1000),
        },
      });

      return { mfaRequired: true, mfaToken };
    }

    const tokens = await this.issueTokens(user);
    return {
      tokens,
      user: this.toAuthenticatedUser(user),
    };
  }

  async verifyMfaLogin(mfaToken: string, code: string): Promise<LoginResult> {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwt.verify(mfaToken, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired MFA token');
    }

    if (payload.purpose !== 'mfa') {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const tokenHash = crypto.createHash('sha256').update(mfaToken).digest('hex');
    const mfaRecord = await this.prisma.mfaCode.findFirst({
      where: { userId: payload.sub, codeHash: tokenHash, used: false },
    });

    if (!mfaRecord || mfaRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('MFA token expired');
    }

    if (mfaRecord.attempts >= MAX_MFA_ATTEMPTS) {
      await this.prisma.mfaCode.update({
        where: { id: mfaRecord.id },
        data: { used: true },
      });
      throw new UnauthorizedException('Too many MFA attempts');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    const valid = this.mfa.verifyToken(user.mfaSecret, code);
    if (!valid) {
      await this.prisma.mfaCode.update({
        where: { id: mfaRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.prisma.mfaCode.update({
      where: { id: mfaRecord.id },
      data: { used: true },
    });

    const tokens = await this.issueTokens(user);
    return {
      tokens,
      user: this.toAuthenticatedUser(user),
    };
  }

  async enableMfa(userId: string): Promise<{ secret: string; qrDataUrl: string; otpauthUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    const setup = await this.mfa.generateSecret(user.email);
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: setup.secret },
    });

    return {
      secret: setup.secret,
      qrDataUrl: setup.qrDataUrl,
      otpauthUrl: setup.otpauthUrl,
    };
  }

  async verifyMfaSetup(userId: string, code: string): Promise<{ enabled: true }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA setup not started');
    }
    if (user.mfaEnabled) {
      throw new BadRequestException('MFA already enabled');
    }

    const valid = this.mfa.verifyToken(user.mfaSecret, code);
    if (!valid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { enabled: true };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revoked: false },
      data: { revoked: true },
    });
    return { success: true };
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException();
    return this.toAuthenticatedUser(user);
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const newAttempts = user.failedLoginAttempts + 1;
    const update: Prisma.UserUpdateInput = { failedLoginAttempts: newAttempts };
    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      update.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      update.failedLoginAttempts = 0;
      this.logger.warn(`Account locked for user=${user.email}`);
    }
    await this.prisma.user.update({ where: { id: user.id }, data: update });
  }

  private async issueTokens(
    user: User & { userRoles: { role: { name: RoleEnum } }[] },
  ): Promise<AuthTokens> {
    const roles = user.userRoles.map((ur) => ur.role.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      storeId: user.storeId,
    };

    const accessTtl = this.config.get<number>('jwt.accessTtl') ?? 900;
    const refreshTtl = this.config.get<number>('jwt.refreshTtl') ?? 604800;

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: refreshTtl,
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTtl,
    };
  }

  private toAuthenticatedUser(
    user: User & { userRoles: { role: { name: RoleEnum } }[] },
  ): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      storeId: user.storeId,
      mfaEnabled: user.mfaEnabled,
      roles: user.userRoles.map((ur) => ur.role.name),
    };
  }
}
