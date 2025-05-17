import React, { useEffect, useState, memo, useMemo } from 'react';
import { Image, ImageProps, ImageURISource, ActivityIndicator, View, Text, ImageSourcePropType } from 'react-native';
import imagePreloader from '../utils/imagePreloader';
import { isUnsplashUrl, getMockImage, getCategoryFallback, TRANSPARENT_PIXEL } from '../utils/imageFallbacks';

type ImageSource = string | ImageURISource;

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSource;
  lowQualitySource?: ImageSource;
  placeholderColor?: string;
  loadingIndicator?: boolean;
  fallbackText?: string;
  fallbackImage?: any; // Local fallback image to use if the main image fails to load
  preload?: boolean; // Whether to use the preloader
}

const OptimizedImage = memo(({
  source,
  lowQualitySource,
  placeholderColor = '#e2e8f0',
  style,
  loadingIndicator = false,
  fallbackText,
  fallbackImage,
  preload = true,
  ...props
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Used to force re-render on recovery attempts
  
  // Extract the URI from either string or object source
  const uri = useMemo(() => {
    if (!source) return '';
    
    try {
      if (typeof source === 'string') {
        // Validate string URL
        if (!source.trim()) return '';
        
        // Check if it's a valid URL for remote images
        if (source.startsWith('http')) {
          try {
            new URL(source);
            return source;
          } catch (e) {
            console.warn('Invalid URL format:', source);
            return '';
          }
        }
        
        return source; // Local path or other format
      }
      
      if (typeof source === 'object' && 'uri' in source && typeof source.uri === 'string') {
        // Validate URI in object
        if (!source.uri.trim()) return '';
        
        // Check if it's a valid URL for remote images
        if (source.uri.startsWith('http')) {
          try {
            new URL(source.uri);
            return source.uri;
          } catch (e) {
            console.warn('Invalid URL format in URI object:', source.uri);
            return '';
          }
        }
        
        return source.uri;
      }
    } catch (error) {
      console.warn('Error extracting URI from source:', error);
    }
    
    return '';
  }, [source]);
  
  // Determine if we should use a local fallback when loading remote images
  const shouldUseLocalFallback = useMemo(() => {
    try {
      return uri && typeof uri === 'string' && isUnsplashUrl(uri);
    } catch (error) {
      console.warn('Error in shouldUseLocalFallback:', error);
      return true; // Default to using fallback on error
    }
  }, [uri]);
  
  // Default fallback image if not provided
  const defaultFallback = useMemo(() => {
    try {
      return getMockImage() || TRANSPARENT_PIXEL;
    } catch (error) {
      console.warn('Error getting default fallback:', error);
      return TRANSPARENT_PIXEL;
    }
  }, []);
  
  // Check if source is completely invalid
  const isInvalidSource = useMemo(() => {
    try {
      // Basic null/undefined check
      if (!source) return true;
      
      // String source checks
      if (typeof source === 'string') {
        // Empty string
        if (!source.trim()) return true;
        
        // Invalid URL format for remote images
        if (source.startsWith('http')) {
          try {
            new URL(source);
          } catch (e) {
            return true; // Invalid URL
          }
        }
        
        return false; // Passed all checks
      }
      
      // Object source checks
      if (typeof source === 'object') {
        // Check if it has a uri property
        if (!('uri' in source) || typeof source.uri !== 'string') return true;
        
        // Empty uri
        if (!source.uri.trim()) return true;
        
        // Invalid URL format for remote images
        if (source.uri.startsWith('http')) {
          try {
            new URL(source.uri);
          } catch (e) {
            return true; // Invalid URL
          }
        }
        
        return false; // Passed all checks
      }
      
      return true; // Unknown type
    } catch (error) {
      console.warn('Error in isInvalidSource:', error);
      return true;
    }
  }, [source]);
  
  // Check initial loading state on mount
  useEffect(() => {
    // If source is invalid, set error state
    if (isInvalidSource) {
      setError(true);
      return;
    }
    
    if (!uri) {
      setError(true);
      return;
    }
    
    try {
      // Check if the image is already cached or failed
      if (imagePreloader.isImagePreloaded(uri)) {
        setLoaded(true);
      } else if (imagePreloader.hasImageFailed(uri)) {
        setError(true);
      } else if (imagePreloader.isImageLoading(uri)) {
        setLoading(true);
      } else if (preload) {
        setLoading(true);
        // Don't await - the preloader now resolves immediately
        // and handles the loading in the background
        imagePreloader.preloadImage(uri);
      }
    } catch (error) {
      console.warn('Error in image loading check:', error);
      setError(true);
    }
  }, [uri, preload, isInvalidSource]);
  
  // Subscribe to loading status changes
  useEffect(() => {
    if (!uri || !loading) return;
    
    let isMounted = true;
    let checkCount = 0;
    const MAX_CHECKS = 20; // Limit to prevent infinite checking
    
    // Check every 500ms if the image has been loaded or failed
    const interval = setInterval(() => {
      try {
        checkCount++;
        
        if (checkCount > MAX_CHECKS) {
          if (isMounted) {
            console.warn(`Max check count reached for image: ${uri}`);
            setLoading(false);
            setError(true);
          }
          clearInterval(interval);
          return;
        }
        
        if (imagePreloader.isImagePreloaded(uri)) {
          if (isMounted) {
            setLoading(false);
            setLoaded(true);
          }
          clearInterval(interval);
        } else if (imagePreloader.hasImageFailed(uri)) {
          if (isMounted) {
            setLoading(false);
            setError(true);
          }
          clearInterval(interval);
        }
      } catch (error) {
        console.warn('Error checking image status:', error);
        if (isMounted) {
          setLoading(false);
          setError(true);
        }
        clearInterval(interval);
      }
    }, 500);
    
    // Clean up interval
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [uri, loading]);
  
  // Handle when the image is loaded
  const handleLoad = () => {
    try {
      setLoaded(true);
      setLoading(false);
      setError(false);
    } catch (error) {
      console.warn('Error in handleLoad:', error);
    }
  };
  
  // Handle when the image fails to load
  const handleError = (e: any) => {
    try {
      console.warn(`Image failed to load: ${uri}`, e.nativeEvent?.error);
      setError(true);
      setLoading(false);
      // Attempt to recover once by forcing a re-render
      if (renderKey === 0) {
        setTimeout(() => setRenderKey(prev => prev + 1), 500);
      }
    } catch (error) {
      console.warn('Error in handleError:', error);
      setError(true);
      setLoading(false);
    }
  };
  
  // Safe formattedSource with validation
  const formattedSource = useMemo<ImageSourcePropType | undefined>(() => {
    if (error || isInvalidSource) return undefined;
    
    try {
      if (typeof source === 'string') {
        if (!source.trim()) return undefined;
        return { uri: source };
      }
      return source as ImageSourcePropType;
    } catch (err) {
      console.warn('Error formatting source:', err);
      return undefined;
    }
  }, [source, error, isInvalidSource]);
  
  // Safe formattedLowQualitySource with validation
  const formattedLowQualitySource = useMemo<ImageSourcePropType | undefined>(() => {
    if (!lowQualitySource) return undefined;
    
    try {
      if (typeof lowQualitySource === 'string') {
        if (!lowQualitySource.trim()) return undefined;
        return { uri: lowQualitySource };
      }
      return lowQualitySource as ImageSourcePropType;
    } catch (err) {
      console.warn('Error formatting lowQualitySource:', err);
      return undefined;
    }
  }, [lowQualitySource]);

  // Create the fallback text from URI or prop
  const displayFallbackText = fallbackText || (uri ? 'Image' : 'No image');

  // If we have an error or invalid source and a fallback image is provided or it's an Unsplash URL
  // Enhanced with more safety checks
  const useFallbackImage = useMemo(() => {
    try {
      // Basic condition
      const shouldUseFallback = (error || isInvalidSource);
      
      if (!shouldUseFallback) return false;
      
      // Check if we have a fallback image provided
      const hasFallbackImage = !!fallbackImage;
      
      // Check if we should use local fallback for remote URLs
      const shouldUseLocalFallbackForRemote = shouldUseLocalFallback && !!defaultFallback;
      
      return hasFallbackImage || shouldUseLocalFallbackForRemote;
    } catch (e) {
      console.warn('Error in useFallbackImage calculation:', e);
      // Default to true on error - better to try showing a fallback than nothing
      return true;
    }
  }, [error, isInvalidSource, fallbackImage, shouldUseLocalFallback, defaultFallback]);

  // Safe fallback image source with additional verification
  const fallbackImageSource = useMemo<ImageSourcePropType | undefined>(() => {
    if (!useFallbackImage) return undefined;
    
    try {
      // Use the provided fallback or default
      const fallbackSource = fallbackImage || defaultFallback;
      
      // If it's falsy, return a transparent image
      if (!fallbackSource) {
        console.warn('No valid fallback image available, using transparent pixel');
        return TRANSPARENT_PIXEL;
      }
      
      return fallbackSource;
    } catch (error) {
      console.warn('Error preparing fallback image:', error);
      // Return a transparent pixel as last resort
      return TRANSPARENT_PIXEL;
    }
  }, [useFallbackImage, fallbackImage, defaultFallback]);

  return (
    <View style={[{ backgroundColor: placeholderColor }, style]}>
      {/* Low quality placeholder image */}
      {!loaded && !error && !isInvalidSource && formattedLowQualitySource && (
        <Image
          source={formattedLowQualitySource}
          style={[{ position: 'absolute', width: '100%', height: '100%' }, style]}
          blurRadius={1}
          {...props}
        />
      )}
      
      {/* Loading indicator */}
      {loading && loadingIndicator && (
        <View style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <ActivityIndicator color="#3b82f6" />
        </View>
      )}
      
      {/* Fallback image when error occurs and fallback is available */}
      {useFallbackImage && fallbackImageSource && (
        <Image
          source={fallbackImageSource}
          style={style}
          resizeMode={props.resizeMode || 'cover'}
          onError={(e) => {
            console.warn('Even fallback image failed to load:', e.nativeEvent?.error);
            // If even the fallback fails, ensure we show the text fallback
            setError(true);
          }}
        />
      )}
      
      {/* Error fallback text when no fallback image is available or fallback image fails */}
      {((error || isInvalidSource) && !useFallbackImage) || (error && useFallbackImage) && (
        <View style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: placeholderColor
        }}>
          <Text style={{ color: '#64748b', textAlign: 'center' }}>
            {displayFallbackText}
          </Text>
        </View>
      )}
      
      {/* Main image - only render if no error and source is valid */}
      {!error && !isInvalidSource && formattedSource && (
        <Image
          key={`image-${renderKey}`}
          source={formattedSource}
          style={[
            style,
            { opacity: loaded ? 1 : 0 }
          ]}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </View>
  );
});

export default OptimizedImage;