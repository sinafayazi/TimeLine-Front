// filepath: /Users/sina/dev/timeline-compare/TimeLine-Front/TimelineNativeApp/src/utils/imageFallbacks.ts

/**
 * Utility for providing fallback images when remote images fail to load
 */

// Define the valid category types
type CategoryType = 
  | 'default' 
  | 'history' 
  | 'science' 
  | 'technology' 
  | 'art' 
  | 'politics'
  | 'sports' 
  | 'music';

// Transparent pixel as absolute final fallback
export const TRANSPARENT_PIXEL = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };

// Create a safe require function that doesn't crash if the asset is missing
const safeRequire = (path: string) => {
  try {
    // For safety, if the path is for default.png, use a direct require
    if (path.includes('default.png')) {
      return require('../../assets/fallbacks/default.png');
    } else if (path.includes('icon.png')) {
      return require('../../assets/icon.png');
    } else {
      // For other assets, use a dynamic approach
      // This is simplified since React Native doesn't support fully dynamic requires
      return require('../../assets/fallbacks/default.png');
    }
  } catch (e) {
    console.warn('Failed to load asset:', path, e);
    return TRANSPARENT_PIXEL;
  }
};

// Default fallback images for different categories
export const FALLBACK_IMAGES: Record<CategoryType, any> = {
  default: safeRequire('../../assets/fallbacks/default.png'),
  history: safeRequire('../../assets/fallbacks/default.png'),
  science: safeRequire('../../assets/fallbacks/default.png'),
  technology: safeRequire('../../assets/fallbacks/default.png'),
  art: safeRequire('../../assets/fallbacks/default.png'),
  politics: safeRequire('../../assets/fallbacks/default.png'),
  sports: safeRequire('../../assets/fallbacks/default.png'),
  music: safeRequire('../../assets/fallbacks/default.png'),
};

// Fallback image pool for random selection
const fallbackPool = [
  safeRequire('../../assets/fallbacks/default.png'),
  safeRequire('../../assets/icon.png'),
].filter(Boolean); // Filter out any null values

/**
 * Checks if a URL is from Unsplash or any external source
 * @param url The URL to check
 * @returns True if it's an external URL
 */
export const isUnsplashUrl = (url: string): boolean => {
  if (!url) return false;
  
  try {
    // Check if it's a valid URL (will throw an error if not)
    new URL(url);
    // It's external if it starts with http:// or https://
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    // Not a valid URL, likely a local asset reference
    return false;
  }
};

/**
 * Gets a fallback image for a specific category
 * @param category The category to get a fallback image for
 * @returns A fallback image based on the category
 */
export const getCategoryFallback = (category: string): any => {
  try {
    // Normalize the category name and ensure it exists
    const normalizedCategory = category?.toLowerCase();
    
    // If the category is invalid, use default
    if (!normalizedCategory) {
      return FALLBACK_IMAGES.default || TRANSPARENT_PIXEL;
    }
    
    // Check if the normalized category is in our valid category types
    if (Object.keys(FALLBACK_IMAGES).includes(normalizedCategory)) {
      const typedCategory = normalizedCategory as CategoryType;
      const fallback = FALLBACK_IMAGES[typedCategory];
      if (fallback) return fallback;
    }
    
    // If we don't have a specific fallback for this category, try the default
    if (FALLBACK_IMAGES.default) {
      return FALLBACK_IMAGES.default;
    }
    
    // Last resort fallback
    try {
      return require('../../assets/fallbacks/default.png');
    } catch (e) {
      console.warn('Failed to load default fallback image:', e);
      return TRANSPARENT_PIXEL;
    }
  } catch (error) {
    // In case of any error, try the most direct approach
    console.warn('Error getting category fallback:', error);
    try {
      return require('../../assets/fallbacks/default.png');
    } catch (e) {
      console.warn('Failed to load emergency fallback image:', e);
      return TRANSPARENT_PIXEL;
    }
  }
};

/**
 * Gets a random fallback image from the pool
 * @returns A random fallback image
 */
export const getMockImage = (): any => {
  try {
    // First check if the pool has any items
    if (!fallbackPool || fallbackPool.length === 0) {
      console.warn('Fallback image pool is empty');
      // Fallback to inline require as a last resort
      try {
        return require('../../assets/icon.png');
      } catch (e) {
        console.warn('Failed to load icon.png as fallback');
        // Return a transparent pixel as last resort
        return TRANSPARENT_PIXEL;
      }
    }
    
    // Return a random image from the pool
    const randomIndex = Math.floor(Math.random() * fallbackPool.length);
    const fallbackImage = fallbackPool[randomIndex];
    
    // Double-check the selected image is valid
    if (!fallbackImage) {
      console.warn('Selected fallback image is null');
      const firstValidImage = fallbackPool.find(Boolean);
      if (firstValidImage) return firstValidImage;
      
      // If no valid image found, use transparent pixel
      return TRANSPARENT_PIXEL;
    }
    
    return fallbackImage;
  } catch (error) {
    // In case of any error, return a transparent pixel
    console.warn('Error getting mock image:', error);
    try {
      return require('../../assets/fallbacks/default.png');
    } catch (e) {
      console.warn('Failed to load default.png as emergency fallback');
      // Return a transparent 1x1 pixel image as absolute last resort
      return TRANSPARENT_PIXEL;
    }
  }
};