import { Image, Platform } from 'react-native';

/**
 * Utility for preloading images to improve performance with
 * enhanced queue management, concurrency control, and error handling
 * Includes platform-specific optimizations
 * OPTIMIZED: Reduced memory usage and improved stability
 */
class ImagePreloader {
  private static instance: ImagePreloader;
  private preloadedImages: Set<string> = new Set();
  private failedImages: Set<string> = new Set();
  private loadingImages: Set<string> = new Set();
  private imageQueue: string[] = [];
  private processingQueue: boolean = false;
  private maxConcurrent: number = 1; // REDUCED to prevent memory overload
  private retryCount: Map<string, number> = new Map();
  private maxRetries: number = 0; // NO RETRIES to prevent excessive attempts
  private maxCacheSize: number = 20; // Limit cache size to prevent memory leaks
  private queueDebounceTimerId: NodeJS.Timeout | null = null;
  
  // Singleton pattern
  public static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  /**
   * Check if an image is currently being loaded
   * @param uri Image URI to check
   * @returns Boolean indicating if image is currently loading
   */
  public isImageLoading(uri: string): boolean {
    return this.loadingImages.has(uri);
  }
  
  /**
   * Queue an image for preloading - returns immediately but processes in the background
   * @param uri Image URI to preload
   * @returns Promise that resolves immediately (actual loading happens in background)
   */
  public preloadImage(uri: string): Promise<void> {
    try {
      // Validate URI
      if (!uri || typeof uri !== 'string') {
        console.warn('Invalid URI passed to preloadImage:', uri);
        return Promise.resolve();
      }
      
      // Skip if already preloaded, already loading, or already known to fail
      if (this.preloadedImages.has(uri) || this.loadingImages.has(uri) || this.failedImages.has(uri)) {
        return Promise.resolve();
      }
      
      // Enforce cache size limits
      this.enforceCacheLimit();
      
      // Add to queue and process queue if not already processing
      this.addToQueue(uri);
      
    } catch (error) {
      console.warn('Error in preloadImage:', error);
    }
    
    // Return immediately - the loading will happen in the background
    return Promise.resolve();
  }
  
  /**
   * Ensure cache size doesn't exceed the limit by removing oldest entries
   * @private
   */
  private enforceCacheLimit(): void {
    try {
      // If cache size exceeds limit, remove oldest entries
      if (this.preloadedImages.size > this.maxCacheSize) {
        // Convert to array to get access to elements by index
        const preloadedArray = Array.from(this.preloadedImages);
        // Remove oldest entries (beginning of array) until within limit
        const entriesToRemove = preloadedArray.slice(0, preloadedArray.length - this.maxCacheSize);
        entriesToRemove.forEach(uri => this.preloadedImages.delete(uri));
      }
      
      // Also enforce limits on failed images cache
      if (this.failedImages.size > this.maxCacheSize) {
        const failedArray = Array.from(this.failedImages);
        const entriesToRemove = failedArray.slice(0, failedArray.length - this.maxCacheSize);
        entriesToRemove.forEach(uri => this.failedImages.delete(uri));
      }
    } catch (error) {
      console.warn('Error enforcing cache limit:', error);
    }
  }

  /**
   * Add an image URI to the processing queue
   * @param uri Image URI to add to queue
   */
  private addToQueue(uri: string): void {
    // Skip if already in queue
    if (this.imageQueue.includes(uri)) {
      return;
    }
    
    // Add to queue
    this.imageQueue.push(uri);
    
    // Debounce queue processing to prevent excessive worklet calls
    if (this.queueDebounceTimerId) {
      clearTimeout(this.queueDebounceTimerId);
    }
    
    this.queueDebounceTimerId = setTimeout(() => {
      this.queueDebounceTimerId = null;
      // Start processing queue if not already processing
      if (!this.processingQueue) {
        this.processQueue();
      }
    }, 100); // Debounce for 100ms
  }

  /**
   * Process the image loading queue with limited concurrency
   */
  private processQueue(): void {
    if (this.imageQueue.length === 0) {
      this.processingQueue = false;
      return;
    }
    
    this.processingQueue = true;
    
    // Calculate how many more images we can load
    const currentlyLoading = this.loadingImages.size;
    const availableSlots = Math.max(0, this.maxConcurrent - currentlyLoading);
    
    // Load as many images as we have slots for
    for (let i = 0; i < availableSlots && this.imageQueue.length > 0; i++) {
      const uri = this.imageQueue.shift();
      if (uri) {
        this.loadImage(uri);
      }
    }
  }

  /**
   * Actually load an individual image
   * @param uri Image URI to load
   */
  private loadImage(uri: string): void {
    // Skip if URI is invalid
    if (!uri || typeof uri !== 'string') {
      console.warn('Invalid URI passed to loadImage:', uri);
      // Remove from queue and continue processing
      setTimeout(() => this.processQueue(), 0);
      return;
    }
    
    // Mark as loading
    this.loadingImages.add(uri);
    
    // Get retry count
    const retries = this.retryCount.get(uri) || 0;
    
    // Use a timeout to prevent hanging indefinitely on slow connections
    const timeoutId = setTimeout(() => {
      console.warn('Image preload timeout:', uri);
      this.handleImageLoadFailure(uri, new Error('Timeout'));
    }, 5000); // 5 second timeout (reduced from 10s)
    
    try {
      // Use platform-specific optimizations
      if (Platform.OS === 'ios') {
        // iOS has better handling of HTTPS URLs
        Image.prefetch(uri)
          .then(() => {
            clearTimeout(timeoutId);
            this.loadingImages.delete(uri);
            this.preloadedImages.add(uri);
            
            // Continue processing queue
            setTimeout(() => this.processQueue(), 0);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            console.warn('Failed to preload image on iOS:', uri, error);
            
            // Handle failure with potential retry
            this.handleImageLoadFailure(uri, error);
          });
      } else {
        // For Android and other platforms, add additional error handling
        Image.prefetch(uri)
          .then((success) => {
            clearTimeout(timeoutId);
            
            if (success) {
              this.loadingImages.delete(uri);
              this.preloadedImages.add(uri);
            } else {
              // Android might return false rather than throwing an error
              this.handleImageLoadFailure(uri, new Error('Image prefetch returned false'));
            }
            
            // Continue processing queue
            setTimeout(() => this.processQueue(), 0);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            console.warn('Failed to preload image on Android:', uri, error);
            
            // Handle failure with potential retry
            this.handleImageLoadFailure(uri, error);
          });
      }
    } catch (error) {
      // Handle unexpected errors (e.g. network errors that don't trigger promise rejection)
      clearTimeout(timeoutId);
      console.warn('Unexpected error during image preloading:', uri, error);
      this.handleImageLoadFailure(uri, error);
    }
  }

  /**
   * Handle image load failure with potential retry logic
   * @param uri The image URI that failed
   * @param error The error that occurred
   */
  private handleImageLoadFailure(uri: string, error: any): void {
    // Remove from loading set
    this.loadingImages.delete(uri);
    
    // Get current retry count
    const retries = this.retryCount.get(uri) || 0;
    
    // Check if we can retry
    if (retries < this.maxRetries) {
      // Increment retry count
      this.retryCount.set(uri, retries + 1);
      
      // Add back to queue with exponential backoff
      setTimeout(() => {
        this.imageQueue.push(uri);
        this.processQueue();
      }, Math.pow(2, retries) * 1000); // Exponential backoff: 1s, 2s, 4s, etc.
    } else {
      // Max retries reached - mark as failed
      this.failedImages.add(uri);
      
      // Continue processing queue
      setTimeout(() => this.processQueue(), 0);
    }
  }

  /**
   * Preload multiple images in parallel, respecting the queue system
   * @param uris Array of image URIs to preload
   * @returns Promise that always resolves immediately (actual loading happens in background)
   */
  public preloadImages(uris: string[]): Promise<void> {
    try {
      if (!uris || !Array.isArray(uris) || uris.length === 0) {
        return Promise.resolve();
      }
      
      // Filter out invalid or already handled URIs
      const uniqueUris = uris.filter(uri => {
        // Basic URI validation
        if (!uri || typeof uri !== 'string' || uri.trim() === '') {
          return false;
        }
        
        // Skip if already handled
        if (this.preloadedImages.has(uri) || 
            this.loadingImages.has(uri) || 
            this.failedImages.has(uri)) {
          return false;
        }
        
        // Additional validation for URLs
        if (uri.startsWith('http')) {
          try {
            new URL(uri);
            return true;
          } catch (e) {
            console.warn('Invalid URL skipped from preloading:', uri);
            return false;
          }
        }
        
        // Valid URI
        return true;
      });
        
      // Add each URI to the queue
      uniqueUris.forEach(uri => this.addToQueue(uri));
    } catch (error) {
      console.warn('Error in preloadImages:', error);
    }
    
    // Return immediately - the loading happens in the background
    return Promise.resolve();
  }

  /**
   * Check if an image has been preloaded
   * @param uri Image URI to check
   * @returns Boolean indicating if image is preloaded
   */
  public isImagePreloaded(uri: string): boolean {
    return this.preloadedImages.has(uri);
  }

  /**
   * Check if an image has failed to load
   * @param uri Image URI to check
   * @returns Boolean indicating if image loading has failed
   */
  public hasImageFailed(uri: string): boolean {
    return this.failedImages.has(uri);
  }

  /**
   * Get stats about the image preloader
   */
  public getStats(): {
    preloadedCount: number;
    failedCount: number;
    loadingCount: number;
    queueLength: number;
  } {
    return {
      preloadedCount: this.preloadedImages.size,
      failedCount: this.failedImages.size,
      loadingCount: this.loadingImages.size,
      queueLength: this.imageQueue.length
    };
  }

  /**
   * Clear the cache of preloaded and failed images
   */
  public clearCache(): void {
    this.preloadedImages.clear();
    this.failedImages.clear();
    this.loadingImages.clear();
    this.imageQueue = [];
    this.retryCount.clear();
    this.processingQueue = false;
    
    // Force garbage collection by nullifying references (signals to JS engine)
    // This is especially important for image data which can be memory intensive
    setTimeout(() => {
      console.log('Image cache cleared successfully');
    }, 50);
  }
  
  /**
   * Limit cache size to prevent memory overflow
   * Called periodically to keep memory usage in check
   */
  public limitCacheSize(): void {
    try {
      const MAX_CACHE_SIZE = 20; // Maximum number of images to keep in cache
      
      // If cache is under the limit, no action needed
      if (this.preloadedImages.size <= MAX_CACHE_SIZE) return;
      
      // Convert sets to arrays so we can remove oldest entries
      const preloadedArray = Array.from(this.preloadedImages);
      
      // Remove oldest entries until we're under the limit
      const itemsToRemove = preloadedArray.slice(0, preloadedArray.length - MAX_CACHE_SIZE);
      
      // Remove from cache
      for (const item of itemsToRemove) {
        this.preloadedImages.delete(item);
      }
      
      console.log(`Image cache limited: removed ${itemsToRemove.length} old items`);
    } catch (error) {
      console.warn('Error limiting cache size:', error);
    }
  }
}

export default ImagePreloader.getInstance();