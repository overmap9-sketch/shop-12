import { Body, Controller, Get, Param, Post, Res, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FilesService, StoredFile } from './files.service.js';
import { JwtGuard, Permissions, PermissionsGuard } from '../auth/guards.js';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ensureDir } from 'fs-extra';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';

function createMulterOptions(opts?: { allowed?: string[]|"*"; maxFileSize?: number; category?: string; maxFiles?: number }) {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  const maxFileSize = opts?.maxFileSize ?? Number(process.env.UPLOAD_MAX_FILE_SIZE || 5 * 1024 * 1024);
  const envAllowed = (process.env.UPLOAD_ALLOWED_MIME || '').split(',').map(s=>s.trim()).filter(Boolean);
  const allowed = opts?.allowed ?? (envAllowed.length ? envAllowed : '*');
  const category = opts?.category || 'general';
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth()+1).padStart(2,'0');
  const destination = join(uploadDir, category, year, month);
  return {
    storage: diskStorage({
      destination: async (_req, _file, cb) => { try { await ensureDir(destination); cb(null, destination); } catch (e) { cb(e as any, destination); } },
      filename: (_req, file, cb) => { const ext = extname(file.originalname).toLowerCase(); cb(null, `${randomUUID()}${ext}`); },
    }),
    fileFilter: (_req: any, file: Express.Multer.File, cb: Function) => {
      if (allowed === '*') return cb(null, true);
      const ok = (allowed as string[]).some((pat) => pat.endsWith('/*') ? file.mimetype.startsWith(pat.slice(0,-1)) : file.mimetype === pat);
      cb(ok ? null : new BadRequestException(`Invalid file type: ${file.mimetype}`), ok);
    },
    limits: { fileSize: maxFileSize },
  };
}

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
