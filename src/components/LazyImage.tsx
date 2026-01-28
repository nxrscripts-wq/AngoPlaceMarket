import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { imageService } from '@/lib/imageService';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    placeholder?: 'blur' | 'shimmer' | 'none';
    fallback?: string;
    onLoad?: () => void;
    onError?: () => void;
}

const PLACEHOLDER_BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=';

export const LazyImage = ({
    src,
    alt,
    width,
    height,
    placeholder = 'shimmer',
    fallback = '/placeholder.svg',
    className,
    onLoad,
    onError,
    ...props
}: LazyImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // Start loading 200px before entering viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        onError?.();
    };

    // Get optimized URL with width/height if provided
    const optimizedSrc = isInView
        ? imageService.getOptimizedUrl(src, width, height)
        : PLACEHOLDER_BLUR;

    const finalSrc = error ? fallback : optimizedSrc;

    return (
        <div
            ref={imgRef}
            className={cn(
                'relative overflow-hidden bg-muted',
                !loaded && placeholder === 'shimmer' && 'animate-pulse',
                className
            )}
            style={{ minHeight: height || 'auto' }}
        >
            {/* Placeholder/Shimmer */}
            {!loaded && placeholder !== 'none' && (
                <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/5 to-muted animate-shimmer" />
            )}

            {/* Actual Image */}
            <img
                src={finalSrc}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                    'transition-opacity duration-300',
                    loaded ? 'opacity-100' : 'opacity-0',
                    className
                )}
                {...props}
            />
        </div>
    );
};

// Simple hook for preloading critical images
export const useImagePreloader = (urls: string[]) => {
    useEffect(() => {
        urls.forEach(url => {
            if (url) imageService.preload(url);
        });
    }, [urls]);
};
