import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductPolicy } from './policies/product.policy';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductPolicy],
  exports: [ProductsService, ProductPolicy],
})
export class ProductsModule {}
