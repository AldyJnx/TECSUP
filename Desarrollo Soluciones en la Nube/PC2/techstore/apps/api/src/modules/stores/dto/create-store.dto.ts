import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: 'TechStore Lima' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'Av. Javier Prado 123, San Isidro' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  address!: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
