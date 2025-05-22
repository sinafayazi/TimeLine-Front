import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  // useAnimatedStyle, 
  // interpolate,
  // Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import { Event } from '../types';
import OptimizedImage from './OptimizedImage';
import { getCategoryFallback } from '../utils/imageFallbacks';

interface TimelineEventFixableProps {
  event: Event;
  index: number; // Keep for potential future use or debugging
  activeIndex: SharedValue<number>; // Keep for animations
  side: 'left' | 'right';
  color: string; // Base color for accents
  textColor: string; // Text color for titles
  lightColor: string; // Background color for the card
  onPress: (event: Event) => void;
  simplified?: boolean;
}

const { width } = Dimensions.get('window');
// ITEM_SIZE is now controlled by WheelTimeline's ITEM_WIDTH, this component will adapt.
// const ITEM_SIZE = width * 0.35; // Remove, as width is passed by parent style

const TRANSPARENT_PIXEL = { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };

const TimelineEventFixable = memo<TimelineEventFixableProps>(({ 
  event, 
  // index, // index from map is used for key, activeIndex for animation logic
  activeIndex, 
  side, 
  color, // e.g., 'bg-blue-500'
  textColor, // e.g., 'text-white'
  lightColor, // e.g., 'bg-blue-100'
  onPress,
  simplified = false
}) => {
  if (!event || typeof event !== 'object' || !event.id || !event.title) {
    return (
      <View style={{ padding: 10, marginVertical: 5, backgroundColor: '#fee2e2', borderRadius: 8 }}>
        <Text style={{ color: '#b91c1c' }}>Invalid event data</Text>
      </View>
    );
  }
  
  const handlePress = useCallback(() => {
    try {
      if (event && event.id) {
        onPress(event);
      }
    } catch (error) {
      console.error('Error in TimelineEventFixable onPress handler:', error);
    }
  }, [event, onPress]);

  const formattedDate = useMemo(() => {
    try {
      if (!event.date) return 'No date';
      const startDateObj = new Date(event.date);
      if (isNaN(startDateObj.getTime())) return 'Invalid start date';

      let dateStr = startDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        // year: 'numeric' // Add year if desired
      });

      if (event.endDate) {
        const endDateObj = new Date(event.endDate);
        if (!isNaN(endDateObj.getTime())) {
          // Check if start and end dates are different
          if (startDateObj.toDateString() !== endDateObj.toDateString()) {
            dateStr += ` - ${endDateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              // year: 'numeric' // Add year if desired, ensure consistency
            })}`;
          }
          // If dates are the same, it implies a single-day event, already formatted.
        } else {
          // endDate is present but invalid
          dateStr += ' (End date invalid)';
        }
      }
      return dateStr;
    } catch (error) {
      console.error("Error formatting date:", event.date, event.endDate, error);
      return 'Date error';
    }
  }, [event.date, event.endDate]);

  const fallbackImage = useMemo(() => {
    try {
      let category = event.category || 'default';
      const fallback = getCategoryFallback(category) || TRANSPARENT_PIXEL;
      return fallback;
    } catch (error) {
      return TRANSPARENT_PIXEL;
    }
  }, [event.category]);

  // The animatedStyle from WheelTimeline handles the scroll-based animation (scale, opacity).
  // This component doesn't need its own useAnimatedStyle based on activeIndex directly for scroll effects,
  // as those are now passed down from WheelTimeline.
  // If item-specific animations (e.g., on hover, or more complex individual reactions) were needed,
  // then a local useAnimatedStyle could be used.

  // For styling, we'll use NativeWind classes primarily.
  // The `color`, `textColor`, `lightColor` props are expected to be Tailwind-compatible class strings.

  // Simplified rendering can be kept if there's a specific need for it under certain conditions.
  if (simplified) {
    return (
      <TouchableOpacity
        className={`rounded-lg shadow-md overflow-hidden border border-gray-200 ${lightColor}`}
        // style={{ width: '100%' }} // Width is set by parent
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View className="p-3">
          <Text className={`font-semibold text-sm ${textColor}`} numberOfLines={2}>
            {event.title}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {formattedDate}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    // The Animated.View wrapper is in WheelTimeline.tsx
    // This component now just returns the TouchableOpacity content.
    // Width and margins are handled by the parent Animated.View in WheelTimeline.
    <TouchableOpacity
      className={`rounded-xl shadow-lg overflow-hidden border border-gray-200 ${lightColor}`}
      // style={{ width: '100%' }} // Width is set by parent in WheelTimeline
      activeOpacity={0.85}
      onPress={handlePress}
    >
      {event.mainImage ? (
        <OptimizedImage
          source={event.mainImage} // This should be a valid URL or require() path
          style={{ width: '100%', height: 100 }} // Fixed height for image consistency
          resizeMode="cover"
          className="w-full" // Ensure it takes full width of its container
          placeholderColor={lightColor || "#e0e0e0"} // Use lightColor for placeholder background
          fallbackImage={fallbackImage} // Local fallback from assets
          fallbackText={event.title} // Text to show if all image attempts fail
          loadingIndicator={true} // Show activity indicator while loading
        />
      ) : (
        <View 
          className={`w-full items-center justify-center ${lightColor || 'bg-gray-100'}`}
          style={{ height: 100 }} // Consistent height with OptimizedImage
        >
          <Text className={`text-sm font-medium ${textColor || 'text-gray-500'} text-center px-2`}>
            No Image Available
          </Text>
        </View>
      )}
      
      <View className="p-3">
        <Text className={`font-bold text-base ${textColor}`} numberOfLines={2}>
          {event.title}
        </Text>
        <Text className={`text-sm mt-1 ${textColor ? textColor.replace('text-', 'text-opacity-75 text-') : 'text-gray-600'}`}> 
          {/* Attempt to make date slightly less prominent if textColor is strong */}
          {formattedDate}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export default TimelineEventFixable;