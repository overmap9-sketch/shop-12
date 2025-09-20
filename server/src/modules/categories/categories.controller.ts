import { Controller, Get, Param, Post, Body, Patch, Delete, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from '../files/multer.options.js';
import { JwtGuard, Permissions, PermissionsGuard } from '../auth/guards.js';
import { FilesService } from '../files/files.service.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService, private readonly files: FilesService) {}

  @Get()
  list(@Query() query: any) { return this.svc.list(query); }

  @Get('tree')
  tree() { return this.svc.tree(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.svc.get(id); }

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }

  @Post(':id/image/upload')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('files:upload')
  @UseInterceptors(FileInterceptor('file', createMulterOptions({ allowed: ['image/*'], category: 'categories' })))
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file is required');
    const saved = await this.files.registerSavedFile(file, { category: 'categories' });
    await this.svc.update(id, { image: saved.publicPath });
    return { categoryId: id, file: saved };
  }
}
