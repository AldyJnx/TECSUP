import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyMfaDto, VerifyMfaSetupDto } from './dto/verify-mfa.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';

const REFRESH_COOKIE = 'techstore_rt';

function setRefreshCookie(res: Response, refreshToken: string, ttlSec: number): void {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth',
    maxAge: ttlSec * 1000,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario (rol EMPLOYEE por defecto)' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login (refresh va en cookie httpOnly cuando aplica)' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    if (result.tokens) {
      const refreshTtl = parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10);
      setRefreshCookie(res, result.tokens.refreshToken, refreshTtl);
      return {
        ...result,
        tokens: {
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      };
    }
    return result;
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verifica código MFA y emite tokens finales' })
  async verifyMfa(
    @Body() dto: VerifyMfaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyMfaLogin(dto.mfaToken, dto.code);
    if (result.tokens) {
      const refreshTtl = parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10);
      setRefreshCookie(res, result.tokens.refreshToken, refreshTtl);
      return {
        ...result,
        tokens: {
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      };
    }
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('mfa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Genera secreto TOTP + QR code' })
  enableMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.enableMfa(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('mfa/verify-setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirma activación de MFA con primer código' })
  verifyMfaSetup(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyMfaSetupDto,
  ) {
    return this.authService.verifyMfaSetup(user.id, dto.code);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rota refresh token desde cookie httpOnly' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieToken = req.cookies?.[REFRESH_COOKIE];
    if (!cookieToken) {
      throw new UnauthorizedException('Refresh token cookie missing');
    }
    const tokens = await this.authService.refresh(cookieToken);
    const refreshTtl = parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10);
    setRefreshCookie(res, tokens.refreshToken, refreshTtl);
    return {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoca refresh token y limpia cookie' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieToken = req.cookies?.[REFRESH_COOKIE];
    if (cookieToken) {
      await this.authService.logout(cookieToken);
    }
    clearRefreshCookie(res);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Datos del usuario actual' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }
}
