import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ enum: RoleEnum })
  @IsEnum(RoleEnum)
  name!: RoleEnum;

  @ApiProperty({ example: 'Administrador del sistema con acceso total' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  description!: string;
}
