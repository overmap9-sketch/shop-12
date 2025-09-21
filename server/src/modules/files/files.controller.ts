import { Body, Controller, Get, Param, Post, Res, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesService, StoredFile } from './files.service.js';
import { JwtGuard, Permissions, PermissionsGuard } from '../auth/guards.js';
import type { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from './multer.options.js';

@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post()
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('files:upload')
  @UseInterceptors(FileInterceptor('file', createMulterOptions({ allowed: '*', category: 'general' })))
  async uploadSingle(@UploadedFile() file: Express.Multer.File, @Body('category') category?: string) {
    if (!file) throw new BadRequestException('file is required');
    return this.files.registerSavedFile(file, { category });
  }

  @Post('many')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('files:upload')
  @UseInterceptors(FilesInterceptor('files', 10, createMulterOptions({ allowed: '*', category: 'general' })))
  async uploadMany(@UploadedFiles() files: Express.Multer.File[], @Body('category') category?: string) {
    if (!files || files.length === 0) throw new BadRequestException('files are required');
    const out: StoredFile[] = [];
    for (const f of files) out.push(await this.files.registerSavedFile(f, { category }));
    return { files: out };
  }

  // Image-specific endpoints with validation and storage layout
  @Post('images')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('files:upload')
  @UseInterceptors(FileInterceptor('file', createMulterOptions({ allowed: ['image/*'], category: 'images' })))
  async uploadImage(@UploadedFile() file: Express.Multer.File) { return this.files.registerSavedFile(file, { category: 'images' }); }

  @Post('images/many')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions('files:upload')
  @UseInterceptors(FilesInterceptor('files', 10, createMulterOptions({ allowed: ['image/*'], category: 'images' })))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const out: StoredFile[] = [];
    for (const f of files) out.push(await this.files.registerSavedFile(f, { category: 'images' }));
    return { files: out };
  }

  @Get(':id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const f = await this.files.get(id);
    if (!f) throw new BadRequestException('File not found');
    res.setHeader('Content-Type', f.mimeType);
    res.setHeader('Content-Length', f.size.toString());
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(f.originalName)}"`);
    return res.sendFile(f.storagePath);
  }
}
