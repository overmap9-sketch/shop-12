import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ensureDir, pathExists, remove } from 'fs-extra';
import { createReadStream } from 'fs';
import { extname, join, resolve, relative } from 'path';
import { randomUUID } from 'crypto';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

export interface StoredFile {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  ext: string;
  storagePath: string; // absolute path
  relativePath: string; // relative to project root
  publicPath: string; // "/uploads/..."
  downloadUrl: string; // "/api/files/:id"
  category?: string; // e.g. products, categories, general
  uploaderId?: string;
  dateCreated?: string;
  dateModified?: string;
}

@Injectable()
export class FilesService {
  private readonly collection = 'files';
  private readonly rootDir: string;

  constructor(private readonly cfg: ConfigService, @Inject(DATA_STORE) private readonly db: DataStore) {
    const dir = this.cfg.get<string>('UPLOAD_DIR') || './uploads';
    this.rootDir = resolve(process.cwd(), dir);
  }

  getUploadRoot() { return this.rootDir; }

  async registerSavedFile(file: Express.Multer.File, opts: { category?: string; uploaderId?: string } = {}): Promise<StoredFile> {
    const ext = extname(file.originalname || file.filename || '').toLowerCase();
    const id = (file as any).id || randomUUID();
    const storagePath = resolve(file.path);
    const relativePath = relative(process.cwd(), storagePath);
    const publicPath = '/' + relative(this.rootDir, storagePath).split('\\').join('/');
    const downloadUrl = `/api/files/${id}`;
    const rec: Omit<StoredFile,'id'> = {
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      ext,
      storagePath,
      relativePath,
      publicPath: '/uploads/' + publicPath.replace(/^\/+/, ''),
      downloadUrl,
      category: opts.category,
      uploaderId: opts.uploaderId,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    const saved = await this.db.insert<StoredFile>(this.collection, { ...(rec as any), id } as any);
    return saved;
  }

  async get(id: string) { return this.db.findById<StoredFile>(this.collection, id); }
  async remove(id: string) {
    const f = await this.get(id);
    if (!f) return false;
    if (await pathExists(f.storagePath)) await remove(f.storagePath);
    return this.db.remove(this.collection, id);
  }

  createReadStream(file: StoredFile) { return createReadStream(file.storagePath); }
}
