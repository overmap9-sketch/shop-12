import { diskStorage } from 'multer';
import { ensureDir } from 'fs-extra';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';

export function createMulterOptions(opts?: { allowed?: string[]|"*"; maxFileSize?: number; category?: string; maxFiles?: number }) {
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
