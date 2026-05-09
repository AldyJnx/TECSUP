import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyMfaDto {
  @ApiProperty({ description: 'Token temporal recibido en /auth/login' })
  @IsString()
  mfaToken!: string;

  @ApiProperty({ example: '123456', description: 'Código TOTP de 6 dígitos' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code!: string;
}

export class VerifyMfaSetupDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}
