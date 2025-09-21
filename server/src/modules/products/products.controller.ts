import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { FilesService } from '../files/files.service.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from '../files/multer.options.js';
import { JwtGuard, Permissions, PermissionsGuard } from '../auth/guards.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly svc: ProductsService, private readonly files: FilesService) {}

  @Get()
  list(@Query() query: any) {
    return this.svc.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.svc.get(id);
  }

  @Post()
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('products:create')
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('products:update')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('products:delete')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Post(':id/images/upload')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('files:upload')
  @UseInterceptors(FilesInterceptor('files', 10, createMulterOptions({ allowed: ['image/*'], category: 'products' })))
  async uploadImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('files are required');
    const saved = await Promise.all(files.map(f => this.files.registerSavedFile(f, { category: 'products' })));
    const urls = saved.map(f => f.publicPath);
    const current = await this.svc.get(id);
    await this.svc.update(id, { images: [ ...(current?.images || []), ...urls ] });
    return { productId: id, files: saved };
  }
}
