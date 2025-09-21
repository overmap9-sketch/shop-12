# Files Module (Uploads, Validation, Permissions)

A reusable NestJS module to upload, validate, store, and serve files. Designed to be secure, clean, and scalable, and integrated with Products and Categories modules.

- Generic file upload (any type), with per-file size validation
- MIME-type validation (allow-list).
- Multiple file upload.
- Persistent metadata stored via the project's pluggable DataStore (JSON or Postgres/Sequelize).
- Public serving via /uploads and secured download via /api/files/:id.
- Permission-gated endpoints using JWT + permissions.
- Ready-made endpoints to attach images to Products and Categories.

## Endpoints

Base path prefix: /api

Files:
- POST /api/files — single upload (form field: file)
- POST /api/files/many — multiple upload (form field: files)
- POST /api/files/images — single image upload (form field: file)
- POST /api/files/images/many — multiple image upload (form field: files)
- GET  /api/files/:id — stream the uploaded file by id

Products integration:
- POST /api/products/:id/images/upload — upload product images, appends to product.images[]

Categories integration:
- POST /api/categories/:id/image/upload — upload category image, sets category.image

All upload endpoints require:
- Header: Authorization: Bearer <JWT>
- Permission: files:upload (or role=admin)

## Request examples

Single file:
- Content-Type: multipart/form-data
- Body: file=<binary>

Multiple files:
- Content-Type: multipart/form-data
- Body: files=<binary>, files=<binary>

Optional body field `category` (for generic endpoints) to group files under subdir (e.g. "invoices"). Specialized endpoints already set category.

## Responses

Successful upload returns metadata like:
{
  id: string,
  originalName: string,
  filename: string,
  mimeType: string,
  size: number,
  ext: string,
  storagePath: string,
  relativePath: string,
  publicPath: "/uploads/<category>/<YYYY>/<MM>/<uuid>.<ext>",
  downloadUrl: "/api/files/<id>",
  category?: string,
  uploaderId?: string,
  dateCreated: string,
  dateModified: string
}

For multiple: { files: StoredFile[] }

## Configuration

Environment variables (optional):
- UPLOAD_DIR (default: ./uploads)
- UPLOAD_MAX_FILE_SIZE (bytes, default: 5242880 = 5MB)
- UPLOAD_ALLOWED_MIME (comma-separated allow-list; default: any)

The server also exposes static files at /uploads (from UPLOAD_DIR). You can use `publicPath` directly in the frontend. If you need gated access, prefer `downloadUrl`.

## Permissions and Auth

- JWT is verified with JWT_SECRET (configured in existing AuthService, default "dev").
- If the JWT payload contains role=admin, uploads are allowed.
- Otherwise, payload must include `permissions: string[]` and contain `files:upload`.

Guards:
- JwtGuard: extracts user from Authorization header
- PermissionsGuard: verifies required permissions

Decorator:
- `@Permissions('files:upload')`

## Storage and Structure

- Disk storage via multer diskStorage.
- Files are grouped into: <UPLOAD_DIR>/<category>/<YYYY>/<MM>/
- Filenames are UUID + original extension to prevent collisions and avoid unsafe names.
- Metadata persisted using the app DataStore: works with JSON or Postgres automatically.

## Validation

- Size: enforced via multer `limits.fileSize`.
- Type: allow-list by exact match (e.g. image/png) or family (e.g. image/*). Generic endpoints allow all types unless `UPLOAD_ALLOWED_MIME` is set.

## Error handling

- 401 if token missing/invalid.
- 403 if missing permission.
- 400 for invalid file type or empty upload.
- 404-like (400) if file id not found on download.

## Integration details

Products:
- Endpoint appends uploaded file `publicPath` values to `product.images[]`.
- You can still PATCH /api/products/:id with `images` directly to manage ordering/removal.

Categories:
- Endpoint sets `category.image` to last uploaded file's `publicPath`.

## Extension points and improvements

- Virus scanning (e.g., ClamAV) after upload; quarantine suspicious files.
- Image processing pipelines (thumbnails, WebP/AVIF variants) via queue/worker.
- Upload quotas per user/role; rate-limiting.
- Signed URLs and short-lived tokens for downloads.
- Cloud backends: add S3/GCS/Azure storage provider; FilesService can be extended to abstract storage and return URLs.
- Soft-delete and versioning of files; reference counting and GC of unreferenced files.
- CDNs for /uploads.
- Audit logs on file access.

## Security considerations

- Filenames are sanitized via UUID-based names.
- MIME-type checks are enforced; consider additional magic-number validation for stricter security.
- CORS is already enabled; ensure only trusted origins in production.
- Limit max files per request (currently 10 in controllers) and global body size in reverse proxy.

## Developer notes

- Module code: server/src/modules/files/*
- Guards/decorator: server/src/modules/auth/guards.ts
- Static serving added in server/src/main.ts
- Products & Categories updated for upload endpoints.

To change defaults, set env vars or adjust `createMulterOptions` and FilesService.
