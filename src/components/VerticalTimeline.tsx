import React, { useRef, useCallback, useEffect } from 'react';
import { View, Dimensions, FlatList, Text, ListRenderItem } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedScrollHandler,
  useDerivedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedReaction
} from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import { Event, Subject } from '../types';
import TimelineEventFixable from './TimelineEventFixable'; // Changed from './TimelineEvent'
import { getTailwindColor } from '../utils/colorUtils';
import imagePreloader from '../utils/imagePreloader';

interface VerticalTimelineProps {
  subject1: Subject;
  subject2: Subject;
  subject1Color: {
    primary: string;
    text: string;
    light: string;
  };
  subject2Color: {
    primary: string;
    text: string;
    light: string;
  };
  onEventPress: (event: Event, subjectColor: string) => void;
}

// Define TimelineItem type to use throughout the component
type TimelineItem = {
  date: string;
  subject1Events: Event[];
  subject2Events: Event[];
  hasSpanningEvents: boolean;
};

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 120; // Increased height for better spacing
const VISIBLE_ITEMS = 5; // Number of visible items at once
const PRELOAD_BUFFER = 3; // REDUCED: Number of additional items to preload beyond visible

// Explicitly type the FlatList with our TimelineItem
const AnimatedFlatList = Animated.createAnimatedComponent<React.ComponentProps<typeof FlatList<TimelineItem>>>(FlatList);

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  subject1,
  subject2,
  subject1Color,
  subject2Color,
  onEventPress
}) => {
  const flatListRef = useRef<FlatList<TimelineItem>>(null);
  
  // Add memory cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear any image preloading when the component unmounts
      imagePreloader.clearCache();
    };
  }, []);
  
  // Add memory cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Clear any image preloading when the component unmounts
      imagePreloader.clearCache();
    };
  }, []);
  
  // Validate subject data to prevent crashes
  const validSubject1 = subject1 && typeof subject1 === 'object' && Array.isArray(subject1.events);
  const validSubject2 = subject2 && typeof subject2 === 'object' && Array.isArray(subject2.events);
  
  if (!validSubject1 || !validSubject2) {
    console.warn('Invalid subject data provided to VerticalTimeline');
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <Text className="text-lg font-bold text-amber-600 mb-2">Timeline Data Issue</Text>
        <Text className="text-sm text-gray-700 text-center">
          Could not load timeline data. The data format may be invalid.
        </Text>
      </View>
    );
  }
  
  // Safely combine and sort all events
  const events = [...(validSubject1 ? subject1.events : []), ...(validSubject2 ? subject2.events : [])]
    .filter(event => event && typeof event === 'object' && event.date)
    .sort((a, b) => {
      try {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } catch (e) {
        console.warn('Date comparison error:', e);
        return 0;
      }
    });
  
  // Get unique dates for the timeline
  const uniqueDates = [...new Set(events.map(event => event.date.split('T')[0]))].sort();
  
  // Prepare timeline data structure with events grouped by date
  const timelineData = uniqueDates.map(date => {
    try {
      const subject1Events = validSubject1 
        ? subject1.events
            .filter(event => event && typeof event === 'object' && event.date && event.date.startsWith(date))
        : [];
            
      const subject2Events = validSubject2 
        ? subject2.events
            .filter(event => event && typeof event === 'object' && event.date && event.date.startsWith(date))
        : [];
        
      return { 
        date, 
        subject1Events, 
        subject2Events,
        // Check if any events span across dates (have endDate)
        hasSpanningEvents: [...subject1Events, ...subject2Events].some(event => event.endDate)
      };
    } catch (e) {
      console.warn('Error creating timeline item for date:', date, e);
      return { 
        date, 
        subject1Events: [], 
        subject2Events: [],
        hasSpanningEvents: false
      };
    }
  });
  
  // Scroll animation values
  const scrollY = useSharedValue(0);
  const activeIndex = useDerivedValue(() => {
    return Math.round(scrollY.value / ITEM_HEIGHT);
  });

  // Preload images for visible and nearby timeline items - optimized implementation
  const preloadImagesForIndex = useCallback((currentIndex: number) => {
    try {
      // Calculate range of indices to preload - tighter range to reduce memory pressure
      const startIdx = Math.max(0, currentIndex - PRELOAD_BUFFER);
      const endIdx = Math.min(timelineData.length - 1, currentIndex + PRELOAD_BUFFER);
      
      // Collect image URLs to preload with strict limits
      const imagesToPreload: string[] = [];
      
      // Set a strict limit on how many images we'll preload at once
      const MAX_IMAGES_TO_PRELOAD = 5;
      let imageCount = 0;
      
      // First prioritize the current index
      if (currentIndex >= 0 && currentIndex < timelineData.length) {
        const currentItem = timelineData[currentIndex];
        
        // Prioritize current index images
        const processEvent = (event: any) => {
          if (imageCount >= MAX_IMAGES_TO_PRELOAD) return;
          if (event && event.mainImage && typeof event.mainImage === 'string' && event.mainImage.trim()) {
            try {
              // Skip if it doesn't look like a URL
              if (!event.mainImage.includes('/')) return;
              
              // For remote URLs, validate
              if (event.mainImage.startsWith('http')) {
                try {
                  new URL(event.mainImage);
                  imagesToPreload.push(event.mainImage);
                  imageCount++;
                } catch (e) {
                  // Invalid URL - silently skip
                }
              } else if (event.mainImage.startsWith('/')) {
                // Local path
                imagesToPreload.push(event.mainImage);
                imageCount++;
              }
            } catch (error) {
              // Silently skip errors
            }
          }
        };
        
        // Process current index first
        currentItem.subject1Events.forEach(processEvent);
        currentItem.subject2Events.forEach(processEvent);
      }
      
      // Then process adjacent indices if we haven't reached the limit
      for (let i = startIdx; i <= endIdx && imageCount < MAX_IMAGES_TO_PRELOAD; i++) {
        // Skip the current index as we already processed it
        if (i === currentIndex) continue;
        
        if (i >= 0 && i < timelineData.length) {
          const item = timelineData[i];
          
          // Process a small number of events from each side
          const processLimitedEvents = (events: any[]) => {
            if (!Array.isArray(events)) return;
            
            // Only process up to 2 events per date to limit memory pressure
            const eventsToProcess = events.slice(0, 2);
            
            for (const event of eventsToProcess) {
              if (imageCount >= MAX_IMAGES_TO_PRELOAD) break;
              
              if (event && event.mainImage && typeof event.mainImage === 'string' && event.mainImage.trim()) {
                try {
                  // Skip if it doesn't look like a URL or path
                  if (!event.mainImage.includes('/')) continue;
                  
                  if (event.mainImage.startsWith('http')) {
                    try {
                      new URL(event.mainImage);
                      imagesToPreload.push(event.mainImage);
                      imageCount++;
                    } catch (e) {
                      // Invalid URL - silently skip
                    }
                  } else if (event.mainImage.startsWith('/')) {
                    // Local path
                    imagesToPreload.push(event.mainImage);
                    imageCount++;
                  }
                } catch (error) {
                  // Silently skip errors
                }
              }
            }
          };
          
          // Process a limited number of events from each subject
          processLimitedEvents(item.subject1Events);
          if (imageCount < MAX_IMAGES_TO_PRELOAD) {
            processLimitedEvents(item.subject2Events);
          }
        }
      }
      
      // Start preloading with additional safeguards
      if (imagesToPreload.length > 0) {
        // Do a final validation check
        const validImages = imagesToPreload.filter(img => 
          img && typeof img === 'string' && img.trim().length > 0 && img.includes('/')
        );
        
        // Strict limit on final batch size
        const imageBatch = validImages.slice(0, MAX_IMAGES_TO_PRELOAD);
        
        if (imageBatch.length > 0) {
          imagePreloader.preloadImages(imageBatch);
        }
      }
    } catch (error) {
      console.warn('Error during image preloading:', error);
    }
  }, [timelineData]);
  
  // Initialize with middle item focused
  useEffect(() => {
    if (flatListRef.current && timelineData.length > 0) {
      // Delay initial scroll to ensure component is rendered
      const timeout = setTimeout(() => {
        try {
          const initialIndex = Math.min(2, timelineData.length - 1);
          flatListRef.current?.scrollToIndex({
            index: initialIndex,
            animated: true,
            viewOffset: height / 3 - ITEM_HEIGHT / 2
          });
          
          // Preload initial images
          preloadImagesForIndex(initialIndex);
        } catch (error) {
          console.warn('Error in initial scroll setup:', error);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [timelineData.length, preloadImagesForIndex]);

  // Use animatedReaction with debouncing logic to prevent excessive calls
  useAnimatedReaction(
    () => Math.round(activeIndex.value), // Round the value to reduce callbacks
    (currentIndex, previousIndex) => {
      // Only trigger preloading when index actually changes and differs by at least 1
      if (currentIndex !== previousIndex && 
          previousIndex !== undefined && 
          previousIndex !== null &&
          Math.abs(currentIndex - (previousIndex as number)) >= 1) {
        runOnJS(preloadImagesForIndex)(currentIndex);
      }
    },
    [preloadImagesForIndex]
  );

  // Optimized scroll handler to prevent memory leaks and reduce worklet executions
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Adjust for viewOffset
      scrollY.value = event.contentOffset.y - (height / 3 - ITEM_HEIGHT / 2);
    },
    onEndDrag: (event) => {
      // Calculate target position for snapping
      const offsetAdjusted = event.contentOffset.y - (height / 3 - ITEM_HEIGHT / 2);
      const index = Math.round(offsetAdjusted / ITEM_HEIGHT);
      
      // Validate index to prevent out-of-bounds errors
      if (index < 0 || index >= timelineData.length) return;
      
      const targetPosition = index * ITEM_HEIGHT + (height / 3 - ITEM_HEIGHT / 2);
      
      // Scroll to the snapped position - with a single runOnJS call
      runOnJS(scrollToPosition)(targetPosition);
    },
    onMomentumEnd: (event) => {
      // Use a timeout to limit frequency of calls
      const offsetAdjusted = event.contentOffset.y - (height / 3 - ITEM_HEIGHT / 2);
      const index = Math.round(offsetAdjusted / ITEM_HEIGHT);
      
      // Validate index to prevent out-of-bounds errors
      if (index < 0 || index >= timelineData.length) return;
      
      const targetPosition = index * ITEM_HEIGHT + (height / 3 - ITEM_HEIGHT / 2);
      
      // Scroll to the snapped position - with a single runOnJS call
      runOnJS(scrollToPosition)(targetPosition);
    }
  });

  // Separate function to handle scrolling that can be called from the worklet
  const scrollToPosition = useCallback((position: number) => {
    try {
      flatListRef.current?.scrollToOffset({ 
        offset: position, 
        animated: true 
      });
    } catch (error) {
      console.warn('Error scrolling to position:', error);
    }
  }, []);

  // Handle event press with additional error checking
  const handleEventPress = useCallback((event: Event, isSubject1: boolean) => {
    try {
      if (!event || typeof event !== 'object') {
        console.warn('Invalid event in handleEventPress');
        return;
      }
      
      onEventPress(
        event, 
        isSubject1 ? subject1Color.primary : subject2Color.primary
      );
    } catch (error) {
      console.warn('Error in handleEventPress:', error);
    }
  }, [subject1Color, subject2Color, onEventPress]);

  // Format the date for display
  const formatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);

  // Enhanced SVG curve with more curvature for visual interest
  const curvePathLeft = `M ${width / 2 - 2} 0 C ${width / 2 - 30} ${height / 3}, ${width / 2 - 20} ${height * 2/3}, ${width / 2 - 2} ${height}`;
  const curvePathRight = `M ${width / 2 + 2} 0 C ${width / 2 + 30} ${height / 3}, ${width / 2 + 20} ${height * 2/3}, ${width / 2 + 2} ${height}`;

  // Get the keys for events to optimize rendering
  const getItemKey = useCallback((item: TimelineItem, index: number) => `date-${item.date}-${index}`, []);
  
  // Handle scroll to index error (e.g., if index is out of bounds)
  const handleScrollToIndexFailed = useCallback((info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    console.warn('Failed to scroll to index', info);
    // Fallback - just scroll to beginning
    try {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.warn('Error in handleScrollToIndexFailed:', error);
    }
  }, []);
  
  // Memoized renderItem function to optimize performance
  const renderItem: ListRenderItem<TimelineItem> = useCallback(({ item, index }) => {
    // Safety check for item
    if (!item || typeof item !== 'object') {
      console.warn('Invalid item in renderItem');
      return null;
    }
    
    // Ensure we have arrays, even if empty
    const subject1Events = item.subject1Events || [];
    const subject2Events = item.subject2Events || [];
    
    try {
      return (
        <View style={{ height: ITEM_HEIGHT, width }} className="justify-center">
          {/* Center date indicator with more prominent styling */}
          <View className="absolute self-center z-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200">
            <Text className="text-center font-bold text-gray-800">
              {formatDate(item.date)}
            </Text>
            {item.hasSpanningEvents && (
              <View className="h-1 w-10 bg-gray-300 rounded-full self-center mt-1" />
            )}
          </View>
          
          {/* Left side events (Subject 1) */}
          {subject1Events.map((event, eventIndex) => {
            // Skip rendering invalid events
            if (!event || typeof event !== 'object' || !event.id) {
              console.warn('Invalid event in subject1Events:', event);
              return null;
            }
            
            return (
              <TimelineEventFixable
                key={`left-${event.id}-${eventIndex}`}
                event={event}
                index={index}
                activeIndex={activeIndex}
                side="left"
                color={subject1Color.primary}
                textColor={subject1Color.text}
                lightColor={subject1Color.light}
                onPress={() => handleEventPress(event, true)}
              />
            );
          })}
          
          {/* Right side events (Subject 2) */}
          {subject2Events.map((event, eventIndex) => {
            // Skip rendering invalid events
            if (!event || typeof event !== 'object' || !event.id) {
              console.warn('Invalid event in subject2Events:', event);
              return null;
            }
            
            return (
              <TimelineEventFixable
                key={`right-${event.id}-${eventIndex}`}
                event={event}
                index={index}
                activeIndex={activeIndex}
                side="right"
                color={subject2Color.primary}
                textColor={subject2Color.text}
                lightColor={subject2Color.light}
                onPress={() => handleEventPress(event, false)}
              />
            );
          })}
        </View>
      );
    } catch (error) {
      console.warn('Error rendering timeline item:', error);
      
      // Return a simple placeholder in case of render error
      return (
        <View style={{ height: ITEM_HEIGHT, width }} className="justify-center">
          <View className="absolute self-center z-10 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200">
            <Text className="text-center font-bold text-gray-800">
              Error loading events
            </Text>
          </View>
        </View>
      );
    }
  }, [activeIndex, handleEventPress, subject1Color, subject2Color, formatDate]);
  
  return (
    <View className="flex-1">
      {/* Timeline SVG curves for enhanced 3D effect */}
      <Svg
        height={height}
        width={width}
        style={{ position: 'absolute', zIndex: 0 }}
      >
        {/* Left curve */}
        <Path
          d={curvePathLeft}
          stroke="#E2E8F0" // Tailwind slate-200
          strokeWidth="3"
          fill="transparent"
        />
        {/* Right curve */}
        <Path
          d={curvePathRight}
          stroke="#E2E8F0" // Tailwind slate-200
          strokeWidth="3"
          fill="transparent"
        />
        {/* Center line */}
        <Path
          d={`M ${width / 2} 0 L ${width / 2} ${height}`}
          stroke="#CBD5E1" // Tailwind slate-300 
          strokeWidth="3"
          strokeDasharray="4,4" // Dashed line for center
          fill="transparent"
        />
      </Svg>
      
      <AnimatedFlatList
        ref={flatListRef}
        data={timelineData}
        keyExtractor={getItemKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: height / 3,
          paddingBottom: height / 3
        }}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        initialNumToRender={VISIBLE_ITEMS * 2}
        maxToRenderPerBatch={VISIBLE_ITEMS * 2}
        windowSize={VISIBLE_ITEMS * 2}
        removeClippedSubviews={true}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        renderItem={renderItem}
      />
    </View>
  );
};

export default React.memo(VerticalTimeline);