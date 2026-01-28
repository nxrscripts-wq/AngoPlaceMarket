import { supabase } from './supabase';

interface UploadOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    bucket: 'products' | 'avatars' | 'banners' | 'chat-images' | 'reviews';
    folder?: string;
}

interface UploadResult {
    url: string;
    path: string;
    size: number;
    originalSize: number;
    compressionRatio: number;
}

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Magic bytes for file type validation
const FILE_SIGNATURES: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'image/gif': [0x47, 0x49, 0x46, 0x38],
};

// Bucket-specific size limits (in bytes)
const SIZE_LIMITS: Record<string, number> = {
    'products': 5 * 1024 * 1024,      // 5MB
    'avatars': 2 * 1024 * 1024,        // 2MB
    'banners': 10 * 1024 * 1024,       // 10MB
    'chat-images': 5 * 1024 * 1024,    // 5MB
    'reviews': 3 * 1024 * 1024,        // 3MB
};

// Default dimensions by bucket
const DEFAULT_DIMENSIONS: Record<string, { maxWidth: number; maxHeight: number }> = {
    'products': { maxWidth: 1200, maxHeight: 1200 },
    'avatars': { maxWidth: 400, maxHeight: 400 },
    'banners': { maxWidth: 1920, maxHeight: 600 },
    'chat-images': { maxWidth: 800, maxHeight: 800 },
    'reviews': { maxWidth: 800, maxHeight: 800 },
};

/**
 * Validates file by checking magic bytes (not just extension)
 */
async function validateFileSignature(file: File): Promise<boolean> {
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    for (const [, signature] of Object.entries(FILE_SIGNATURES)) {
        if (signature.every((byte, index) => bytes[index] === byte)) {
            return true;
        }
    }
    return false;
}

/**
 * Compresses and resizes image using Canvas API
 */
async function compressImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
        }

        img.onload = () => {
            let { width, height } = img;

            // Calculate new dimensions maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;

            // Draw with smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to WebP for better compression (fallback to JPEG)
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        // Fallback to JPEG if WebP fails
                        canvas.toBlob(
                            (jpegBlob) => {
                                if (jpegBlob) resolve(jpegBlob);
                                else reject(new Error('Compression failed'));
                            },
                            'image/jpeg',
                            quality
                        );
                    }
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Generates a secure filename to prevent path traversal
 */
function generateSecureFilename(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = 'webp'; // Always save as WebP after compression
    return `${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * Professional Image Upload Service
 */
export const imageService = {
    /**
     * Upload an image with automatic compression, resizing, and validation
     */
    upload: async (file: File, options: UploadOptions): Promise<UploadResult> => {
        const { bucket, folder } = options;
        const maxWidth = options.maxWidth || DEFAULT_DIMENSIONS[bucket]?.maxWidth || 1200;
        const maxHeight = options.maxHeight || DEFAULT_DIMENSIONS[bucket]?.maxHeight || 1200;
        const quality = options.quality || 0.85;
        const sizeLimit = SIZE_LIMITS[bucket] || 5 * 1024 * 1024;

        // 1. Validate MIME type
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Tipo de ficheiro não permitido. Use JPEG, PNG, WebP ou GIF.');
        }

        // 2. Validate file signature (magic bytes)
        const isValidSignature = await validateFileSignature(file);
        if (!isValidSignature) {
            throw new Error('Ficheiro inválido ou corrompido.');
        }

        // 3. Validate file size (before compression)
        if (file.size > sizeLimit * 2) {
            throw new Error(`Ficheiro muito grande. Máximo: ${Math.round(sizeLimit / 1024 / 1024)}MB`);
        }

        // 4. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Utilizador não autenticado.');
        }

        // 5. Compress and resize
        const compressedBlob = await compressImage(file, maxWidth, maxHeight, quality);

        // 6. Validate compressed size
        if (compressedBlob.size > sizeLimit) {
            throw new Error(`Imagem ainda muito grande após compressão. Tente uma imagem menor.`);
        }

        // 7. Generate secure filename
        const baseFolder = folder ? `${folder}/` : '';
        const filePath = `${baseFolder}${generateSecureFilename(file.name, user.id)}`;

        // 8. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, compressedBlob, {
                contentType: 'image/webp',
                cacheControl: '31536000', // 1 year cache
                upsert: false
            });

        if (uploadError) {
            throw new Error(`Erro no upload: ${uploadError.message}`);
        }

        // 9. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: filePath,
            size: compressedBlob.size,
            originalSize: file.size,
            compressionRatio: Math.round((1 - compressedBlob.size / file.size) * 100)
        };
    },

    /**
     * Upload multiple images
     */
    uploadMultiple: async (files: File[], options: UploadOptions): Promise<UploadResult[]> => {
        const results = await Promise.all(
            files.map(file => imageService.upload(file, options))
        );
        return results;
    },

    /**
     * Delete an image from storage
     */
    delete: async (path: string, bucket: UploadOptions['bucket']): Promise<void> => {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw new Error(`Erro ao eliminar: ${error.message}`);
    },

    /**
     * Get optimized image URL with Supabase transformations
     */
    getOptimizedUrl: (url: string, width?: number, height?: number): string => {
        if (!url.includes('supabase.co/storage')) return url;

        const params = new URLSearchParams();
        if (width) params.set('width', width.toString());
        if (height) params.set('height', height.toString());
        params.set('quality', '80');

        return `${url}?${params.toString()}`;
    },

    /**
     * Preload an image for faster display
     */
    preload: (url: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = url;
        });
    }
};
