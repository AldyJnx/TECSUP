import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types';
import { Audit, AuditInterceptor } from '../audit-log/audit.interceptor';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditInterceptor)
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @Audit('product')
  @ApiOperation({ summary: 'Crear producto (ABAC: ADMIN/MANAGER/EMPLOYEE)' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.products.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar productos (filtros automáticos por rol)' })
  findAll(@Query() query: QueryProductDto, @CurrentUser() user: AuthenticatedUser) {
    return this.products.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto (ABAC)' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.products.findOne(id, user);
  }

  @Patch(':id')
  @Audit('product')
  @ApiOperation({ summary: 'Actualizar producto (ABAC con whitelist por rol)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.products.update(id, dto, user);
  }

  @Delete(':id')
  @Audit('product')
  @ApiOperation({ summary: 'Soft delete de producto (ABAC: ADMIN o MANAGER no premium)' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.products.remove(id, user);
  }
}
