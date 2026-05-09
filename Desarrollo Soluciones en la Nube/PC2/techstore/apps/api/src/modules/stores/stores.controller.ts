import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleEnum } from '@prisma/client';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Crear tienda (ADMIN)' })
  create(@Body() dto: CreateStoreDto) {
    return this.stores.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tiendas (cualquier autenticado)' })
  findAll() {
    return this.stores.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tienda por id' })
  findOne(@Param('id') id: string) {
    return this.stores.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Actualizar tienda (ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return this.stores.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Soft delete de tienda (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.stores.remove(id);
  }
}
