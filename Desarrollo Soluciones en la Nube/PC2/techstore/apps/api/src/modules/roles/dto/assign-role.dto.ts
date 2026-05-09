import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'ID del usuario al que se asigna el rol' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: 'ID del rol a asignar' })
  @IsString()
  roleId!: string;
}
