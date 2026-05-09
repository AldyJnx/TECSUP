import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'manager.lima@techstore.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  @Matches(/[^A-Za-z0-9]/)
  password!: string;

  @ApiProperty({ example: 'María Quispe' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  fullName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  storeId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
