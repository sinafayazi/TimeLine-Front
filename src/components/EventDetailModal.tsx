import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { Event } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OptimizedImage from './OptimizedImage';
import imagePreloader from '../utils/imagePreloader';
import { getCategoryFallback } from '../utils/imageFallbacks';

interface EventDetailModalProps {
  event: Event;
  subjectColor: string;
  isVisible: boolean;
  onClose: () => void;
}

const { height, width } = Dimensions.get('window');

// Transparent pixel as final fallback
const TRANSPARENT_PIXEL = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };

const EventDetailModal: React.FC<EventDetailModalProps> = ({ 
  event, 
  subjectColor, 
  isVisible, 
  onClose 
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  // Validate event data
  const isValidEvent = React.useMemo(() => {
    return event && typeof event === 'object' && event.id && event.title && event.date;
  }, [event]);

  // Ensure we have valid event data before proceeding
  if (!isValidEvent && isVisible) {
    console.warn('Invalid event data provided to EventDetailModal');
    // Close the modal and notify parent
    setTimeout(() => {
      onClose();
    }, 100);
    return null;
  }

  // Optimized image preloading with resource constraints
  React.useEffect(() => {
    if (isVisible && isValidEvent) {
      try {
        const imagesToPreload: string[] = [];
        const MAX_PRELOAD = 2; // Strict limit on number of images to preload
        let preloadCount = 0;
        
        // Only preload main image if it exists and is valid
        if (event.mainImage && typeof event.mainImage === 'string' && event.mainImage.trim()) {
          // For remote URLs, validate URL format
          if (event.mainImage.startsWith('http')) {
            try {
              new URL(event.mainImage);
              imagesToPreload.push(event.mainImage);
              preloadCount++;
            } catch (e) {
              // Skip invalid URL silently
            }
          } else if (event.mainImage.startsWith('/')) {
            // Local paths - only if they seem valid
            imagesToPreload.push(event.mainImage);
            preloadCount++;
          }
        }
        
        // Only include a very limited number of additional images if space permits
        if (preloadCount < MAX_PRELOAD && event.images && Array.isArray(event.images) && event.images.length > 0) {
          // Only consider the first image to avoid overloading memory
          const img = event.images[0];
          if (img && typeof img === 'string' && img.trim()) {
            if (img.startsWith('http')) {
              try {
                new URL(img);
                imagesToPreload.push(img);
              } catch (e) {
                // Skip invalid URL silently
              }
            } else if (img.startsWith('/')) {
              imagesToPreload.push(img);
            }
          }
        }
        
        // Preload only if we have valid images, with timeout for safety
        if (imagesToPreload.length > 0) {
          // Delay slightly to prevent UI jank during modal animation
          const timer = setTimeout(() => {
            imagePreloader.preloadImages(imagesToPreload);
          }, 300);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.warn('Error preloading event images:', error);
      }
    }
    
    // Clean up preloading when modal closes
    return () => {
      if (!isVisible) {
        // Clear image cache when modal closes to free memory
        imagePreloader.clearCache();
      }
    };
  }, [isVisible, event, isValidEvent]);

  // Handle animations
  React.useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = withTiming(height, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [isVisible]);

  // Handle close with animation
  const handleClose = () => {
    try {
      translateY.value = withTiming(height, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      }, () => runOnJS(onClose)());
      
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    } catch (error) {
      console.warn('Error in handleClose:', error);
      // Fallback in case animation fails
      onClose();
    }
  };

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Get the appropriate fallback image based on event category
  const fallbackImage = React.useMemo(() => {
    if (!isValidEvent) return TRANSPARENT_PIXEL;
    
    try {
      // Extract category from event if available
      let category = 'default';
      if (event.category) {
        category = event.category;
      }
      
      const fallback = getCategoryFallback(category);
      
      // If getCategoryFallback returns null, we need to provide a final safety net
      if (fallback === null) {
        console.warn('getCategoryFallback returned null, using hardcoded fallback');
        try {
          return require('../../assets/fallbacks/default.png');
        } catch (e) {
          return TRANSPARENT_PIXEL;
        }
      }
      
      return fallback;
    } catch (error) {
      console.warn('Error getting fallback image:', error);
      // Return a transparent 1x1 pixel image as absolute last resort
      return TRANSPARENT_PIXEL;
    }
  }, [event?.category, isValidEvent]);

  // Don't render if not visible and opacity is 0
  if (!isVisible && opacity.value === 0) return null;
  
  // Also don't render if we don't have a valid event
  if (!isValidEvent) return null;

  // Text color based on the subject color
  const textColor = subjectColor.replace('bg-', 'text-');
  // Color for header based on subject
  const headerColor = subjectColor.replace('-500', '-600');
  // Light color for background
  const lightColor = subjectColor.replace('-500', '-50');

  return (
    <>
      {/* Overlay */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 10,
          },
          overlayStyle
        ]}
        className="flex-1"
      >
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Modal */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '100%',
            zIndex: 20,
            paddingBottom: insets.bottom || 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          },
          modalStyle
        ]}
        className="bg-white"
      >
        {/* Header with title and close button */}
        <View className={`px-4 py-5 ${headerColor}`}>
          <View className="flex-row justify-between items-center">
            <Text className={`text-white font-bold text-xl flex-1`} numberOfLines={1}>
              {event.title}
            </Text>
            <TouchableOpacity onPress={handleClose} className="bg-white/30 rounded-full p-2">
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          className={`${lightColor} max-h-[70vh]`} 
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Image with fallback */}
          <OptimizedImage 
            source={event.mainImage || ''} 
            style={{ width: '100%', height: 220 }} 
            resizeMode="cover"
            loadingIndicator={true}
            fallbackImage={fallbackImage}
            fallbackText={event.title || "Event"}
            placeholderColor="#e2e8f0"
          />

          {/* Date */}
          <View className="px-4 py-3 bg-white">
            <Text className="text-gray-500 text-sm">
              {event.endDate 
                ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                : formatDate(event.date)
              }
            </Text>
          </View>

          {/* Description */}
          <View className="px-4 py-5 bg-white">
            <Text className="text-gray-700 leading-6">{event.description || 'No description available'}</Text>
          </View>

          {/* Additional Images */}
          {event.images && Array.isArray(event.images) && event.images.length > 0 && (
            <View className="px-4 py-2 mt-2 bg-white">
              <Text className={`${textColor} font-bold mb-2`}>Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {event.images.map((image, index) => (
                  <View key={`image-${index}`} className="mr-2">
                    <OptimizedImage
                      source={image || ''}
                      style={{ width: 120, height: 120, borderRadius: 8 }}
                      resizeMode="cover"
                      placeholderColor="#e2e8f0"
                      fallbackImage={fallbackImage}
                      fallbackText="Gallery Image"
                      loadingIndicator={true}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default EventDetailModal;