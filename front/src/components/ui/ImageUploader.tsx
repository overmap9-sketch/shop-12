import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Star, Move, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../shared/ui/Button';

export interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isMain: boolean;
  isUploading?: boolean;
  uploadError?: string;
}

export interface ImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  onUpload?: (file: File) => Promise<string>; // Returns uploaded URL
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  onUpload,
  maxImages = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  disabled = false
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }
    return null;
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleFileUpload = async (files: FileList) => {
    if (disabled) return;

    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);

      if (error) {
        alert(error);
        continue;
      }

      if (images.length + validFiles.length >= maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        break;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create initial image items with loading state
    const newImages: ImageItem[] = validFiles.map((file, index) => ({
      id: generateId(),
      url: URL.createObjectURL(file),
      file,
      isMain: images.length === 0 && index === 0, // First image is main if no existing images
      isUploading: true
    }));

    // Add to images immediately to show loading state
    onChange(prevImages => [...prevImages, ...newImages]);

    // Upload files if onUpload is provided
    if (onUpload) {
      // Process uploads
      for (const newImage of newImages) {
        const file = newImage.file!;

        try {
          const uploadedUrl = await onUpload(file);

          // Update with uploaded URL
          onChange(prevImages =>
            prevImages.map(img =>
              img.id === newImage.id
                ? { ...img, url: uploadedUrl, isUploading: false, file: undefined }
                : img
            )
          );
        } catch (error) {
          // Update with error
          onChange(prevImages =>
            prevImages.map(img =>
              img.id === newImage.id
                ? { ...img, isUploading: false, uploadError: 'Upload failed' }
                : img
            )
          );
        }
      }
    } else {
      // No upload function - mark as completed
      onChange(prevImages =>
        prevImages.map(img => {
          const matchingNew = newImages.find(newImg => newImg.id === img.id);
          return matchingNew ? { ...img, isUploading: false } : img;
        })
      );
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim() || disabled) return;
    
    const newImage: ImageItem = {
      id: generateId(),
      url: urlInput.trim(),
      isMain: images.length === 0
    };
    
    onChange([...images, newImage]);
    setUrlInput('');
  };

  const removeImage = (id: string) => {
    if (disabled) return;
    
    const updatedImages = images.filter(img => img.id !== id);
    
    // If removed image was main, make first image main
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    
    onChange(updatedImages);
  };

  const setMainImage = (id: string) => {
    if (disabled) return;
    
    onChange(images.map(img => ({
      ...img,
      isMain: img.id === id
    })));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || disabled) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove from original position
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    onChange(newImages);
    setDraggedIndex(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDropZone}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground mb-1">
          {isDragging ? 'Drop images here' : 'Upload Images'}
        </p>
        <p className="text-xs text-muted-foreground">
          Drag and drop or click to upload<br />
          {acceptedTypes.join(', ').replace(/image\//g, '').toUpperCase()} up to {maxFileSize}MB each
        </p>
        
        {images.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {images.length} / {maxImages} images
          </p>
        )}
      </div>

      {/* URL Input */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or add by URL</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md"
          placeholder="https://example.com/image.jpg"
          disabled={disabled}
          onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
        />
        <Button 
          type="button" 
          onClick={handleUrlAdd} 
          disabled={!urlInput.trim() || disabled}
        >
          Add URL
        </Button>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Images ({images.length})
            </p>
            <p className="text-xs text-muted-foreground">
              Drag to reorder • Star to set as main
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable={!disabled && !image.isUploading}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  relative group rounded-lg overflow-hidden border-2 transition-all
                  ${image.isMain ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                  ${image.isUploading ? 'opacity-70' : ''}
                  ${!disabled && !image.isUploading ? 'cursor-move hover:shadow-md' : ''}
                `}
              >
                <div className="aspect-square">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0MxMSA3IDkgNS42OTggOSA0VjNIMTVWMkg5VjFIOFYySDJWM0g4VjRDOCA2LjMwMiAxMCA4IDIxIDhWOUgyMVpNOSAxNEg3VjEySDlWMTRaTTE2IDE0SDE0VjEySDI2VjE0SDE2WiIgZmlsbD0iY3VycmVudENvbG9yIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMainImage(image.id)}
                      className={`
                        p-2 rounded-full transition-all text-white
                        ${image.isMain ? 'bg-primary' : 'bg-black bg-opacity-50 hover:bg-primary'}
                      `}
                      title={image.isMain ? 'Main image' : 'Set as main'}
                      disabled={disabled}
                    >
                      <Star className={`h-4 w-4 ${image.isMain ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
                      title="Remove image"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Status Indicators */}
                {image.isMain && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}

                {image.isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-xs">Uploading...</p>
                    </div>
                  </div>
                )}

                {image.uploadError && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                    <div className="text-white text-center">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">Upload failed</p>
                    </div>
                  </div>
                )}

                {!image.isUploading && !image.uploadError && onUpload && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-green-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                )}

                {/* Drag Handle */}
                {!disabled && !image.isUploading && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 text-white p-1 rounded">
                      <Move className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
