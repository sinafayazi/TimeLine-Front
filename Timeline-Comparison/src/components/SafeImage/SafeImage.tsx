import { useState, useEffect } from '@lynx-js/react';
import type { FC } from '@lynx-js/react';

interface SafeImageProps {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  style?: any;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const SafeImage: FC<SafeImageProps> = ({
  src,
  fallbackSrc = '/fallback-image.png',
  alt = 'Image',
  style = {},
  className = '',
  onLoad,
  onError
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset states when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  // Function to validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      if (!urlString) return false;
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle image load error
  const handleError = () => {
    console.warn('Image load error:', src);
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Use placeholder while loading
  const placeholderStyle = {
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };

  // If the src is not a valid URL, use fallback immediately
  const shouldUseFallback = hasError || !isValidUrl(src);
  const imageSrc = shouldUseFallback ? fallbackSrc : src;

  // Return a placeholder if still loading and no image available
  if (isLoading && !shouldUseFallback) {
    return (
      <view style={placeholderStyle} className={className}>
        <text style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</text>
      </view>
    );
  }

  return (
    <image
      src={imageSrc}
      alt={alt}
      style={style}
      className={className}
      bindload={handleLoad}
      binderror={handleError}
    />
  );
};
