// Mock delay to simulate API calls
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export interface ImageUploadResponse {
  url: string;
  id: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface ImageUploadError {
  message: string;
  code: string;
}

export class ImageUploadAPI {
  private static apiBase = '/api';
  private static getAuthHeader() {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('admin-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Upload a single image file to the server
   */
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.apiBase}/files/images`, {
      method: 'POST',
      body: formData,
      headers: { ...this.getAuthHeader() },
      credentials: 'include',
    });
    if (!res.ok) {
      let message = `Upload failed (${res.status})`;
      try { const err = await res.json(); message = err.message || message; } catch {}
      throw new Error(message);
    }
    const data = await res.json();
    // Backend returns StoredFile with publicPath
    return data.publicPath || data.url || data.downloadUrl;
  }

  /**
   * Upload multiple images in batch
   */
  static async uploadImages(files: File[]): Promise<string[]> {
    // Prefer batch endpoint if available
    const form = new FormData();
    for (const f of files) form.append('files', f);
    const res = await fetch(`${this.apiBase}/files/images/many`, {
      method: 'POST',
      body: form,
      headers: { ...this.getAuthHeader() },
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.files)) return data.files.map((f: any)=> f.publicPath || f.url);
    }
    // Fallback to per-file
    return Promise.all(files.map(f=>this.uploadImage(f)));
  }

  /**
   * Delete an uploaded image
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    // Optional: implement real deletion if backend supports it
    return true;
  }

  /**
   * Get image metadata
   */
  static async getImageInfo(imageUrl: string): Promise<ImageUploadResponse | null> {
    await delay(300);

    // Mock response
    return {
      url: imageUrl,
      id: Date.now().toString(),
      originalName: 'image.jpg',
      size: 1024 * 1024, // 1MB
      mimeType: 'image/jpeg'
    };
  }

  /**
   * Optimize/resize image on server
   */
  static async optimizeImage(
    imageUrl: string, 
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    }
  ): Promise<string> {
    await delay(2000);

    // In a real implementation, this would send the image to an optimization service
    console.log('Optimizing image:', imageUrl, options);
    
    // Return optimized URL (mock)
    return `${imageUrl}&optimized=true&w=${options.width || 400}&h=${options.height || 400}`;
  }

  /**
   * Get upload progress for a file (for advanced implementations)
   */
  static async uploadWithProgress(
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate final processing time
          setTimeout(() => {
            if (Math.random() < 0.9) { // 90% success rate
              resolve(`https://picsum.photos/400/400?random=${Date.now()}`);
            } else {
              reject(new Error('Upload failed'));
            }
          }, 500);
        }
        onProgress(Math.min(progress, 100));
      }, 200);
    });
  }

  /**
   * Validate image file before upload
   */
  static validateImage(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
  } = {}): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        minWidth = 0,
        minHeight = 0
      } = options;

      // Check file size
      if (file.size > maxSize) {
        reject(new Error(`File size too large. Maximum: ${maxSize / 1024 / 1024}MB`));
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`));
        return;
      }

      // Check image dimensions
      if (minWidth > 0 || minHeight > 0) {
        const img = new Image();
        img.onload = () => {
          if (img.width < minWidth || img.height < minHeight) {
            reject(new Error(`Image too small. Minimum: ${minWidth}x${minHeight}px`));
          } else {
            resolve(true);
          }
        };
        img.onerror = () => reject(new Error('Invalid image file'));
        img.src = URL.createObjectURL(file);
      } else {
        resolve(true);
      }
    });
  }
}

// Export utility functions
export const imageUtils = {
  /**
   * Convert file to base64 data URL
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  /**
   * Create image thumbnail
   */
  createThumbnail: (file: File, maxWidth: number = 200, maxHeight: number = 200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Get image dimensions
   */
  getImageDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
};
