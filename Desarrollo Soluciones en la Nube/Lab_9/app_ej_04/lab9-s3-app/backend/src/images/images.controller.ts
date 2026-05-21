import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { ImagesService } from './images.service';

@Controller('api')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.imagesService.generateUploadUrl(dto);
  }

  @Get('images')
  listImages() {
    return this.imagesService.listImages();
  }

  // `:key(*)` permite que la key contenga `/` (porque el prefijo es "originales/...").
  @Delete('images/:key(*)')
  deleteImage(@Param('key') key: string) {
    return this.imagesService.deleteImage(key);
  }
}
