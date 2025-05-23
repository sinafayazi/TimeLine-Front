import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StyleSheet, ScrollView, Platform, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Event, Subject } from '../types';
import TimelineEventFixable from './TimelineEvent';
import OptimizedImage from './OptimizedImage';
import { Svg, Line } from 'react-native-svg';

interface WheelTimelineProps {
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
  onEventPress: (event: Event, isSubject1: boolean) => void;
}

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.42; // Adjusted width for side-by-side items
const AXIS_WIDTH = 20; // Width for the central axis line container
const HORIZONTAL_PADDING = 10; // Padding on the sides of the timeline

// Consistent item height and margin definitions
const EFFECTIVE_ITEM_CONTENT_HEIGHT = 300; // Updated height of the event content itself (previously 150)
const ITEM_MARGIN_BOTTOM = 20; // Margin below each event item in the list
const TOTAL_ITEM_STEP_HEIGHT = EFFECTIVE_ITEM_CONTENT_HEIGHT + ITEM_MARGIN_BOTTOM; // Total vertical space one item occupies (updated to reflect new content height)

// Padding constants from styles
const ROOT_VIEW_PADDING_TOP = 20; // From the main View's paddingTop: 20
const SCROLL_CONTENT_PADDING_VERTICAL = height / 3; // From ScrollView's contentContainerStyle.paddingVertical

// Helper function to format date strings
const formatDateForAxis = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') {
    console.warn('formatDateForAxis received null, undefined, or non-string date:', dateString);
    return 'Invalid Date';
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`formatDateForAxis: Parsed to invalid date: '${dateString}'`);
      return 'Invalid Date';
    }
    let year = date.getFullYear();
    let yearStr = '';
    let suffix = '';
    if (year < 0) {
      yearStr = Math.abs(year).toString();
      suffix = ' BC';
    } else {
      yearStr = year.toString().replace(/^0+/, '');
    }
    // Example: "Jan 2023" or "Jan 500 BC"
    return date.toLocaleDateString('en-US', { month: 'short' }) + ' ' + yearStr + suffix;
  } catch (error) {
    console.error(`formatDateForAxis: Error formatting date '${dateString}':`, error);
    return 'Invalid Date'; // Fallback to "Invalid Date" on any error
  }
};

const WheelTimeline: React.FC<WheelTimelineProps> = ({
  subject1,
  subject2,
  subject1Color,
  subject2Color,
  onEventPress
}) => {
  const scrollY = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const [simplifiedMode, setSimplifiedMode] = useState(false);

  const allEvents = useMemo(() => {
    try {
      // Validate before processing to prevent crashes
      const validSubject1 = subject1 && Array.isArray(subject1.events);
      const validSubject2 = subject2 && Array.isArray(subject2.events);
      
      if (!validSubject1 || !validSubject2) {
        console.warn('Invalid subject data provided to WheelTimeline');
        return [];
      }
      
      // Mark events with their source subject
      const s1Events = subject1.events.map(event => ({
        ...event,
        isSubject1: true
      }));
      
      const s2Events = subject2.events.map(event => ({
        ...event,
        isSubject1: false
      }));
      
      // Combine and sort all events
      return [...s1Events, ...s2Events].filter(event => event && event.date)
        .sort((a, b) => {
          // Convert string dates to timestamps for comparison
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        });
    } catch (error) {
      console.error('Error processing timeline events:', error);
      return [];
    }
  }, [subject1, subject2]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // Use TOTAL_ITEM_STEP_HEIGHT for consistent activeIndex calculation
      const currentIdx = Math.round(event.contentOffset.y / TOTAL_ITEM_STEP_HEIGHT);
      activeIndex.value = currentIdx;
    },
  });

  const eventAnimatedStyle = (index: number) => useAnimatedStyle(() => {
    // Calculate the center of the visible area
    // Calculate the vertical center of the visible area to determine the event's proximity to the center of the screen.
    const visibleCenter = scrollY.value + height / 2;
    // Calculate the center of this event
    const eventCenter =
      ROOT_VIEW_PADDING_TOP +
      SCROLL_CONTENT_PADDING_VERTICAL +
      (index * TOTAL_ITEM_STEP_HEIGHT) +
      (EFFECTIVE_ITEM_CONTENT_HEIGHT / 2);
    // Distance from the center
    const distanceFromCenter = Math.abs(visibleCenter - eventCenter);
    // The max distance at which the event is still visible (half the screen height)
    const maxDistance = height / 2;
    // Interpolate scale and opacity based on distance from center
    const scale = 1 - Math.min(distanceFromCenter / maxDistance, 1) * 0.3; // scale from 1 to 0.7
    const opacity = 1 - Math.min(distanceFromCenter / maxDistance, 1) * 0.7; // opacity from 1 to 0.3
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Safety check
  if (allEvents.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg font-semibold text-gray-600">No events to display in the timeline</Text>
      </View>
    );
  }

  // Calculate positions for date ticks
  const dateTicks = allEvents.map((event, index) => {
    // Calculate yPosition to align with the center of the event item's content area (updated for new content height)
    const eventContentCenterY =
      ROOT_VIEW_PADDING_TOP +
      SCROLL_CONTENT_PADDING_VERTICAL +
      (index * TOTAL_ITEM_STEP_HEIGHT) +
      (EFFECTIVE_ITEM_CONTENT_HEIGHT / 2);

    return {
      date: formatDateForAxis(event.date),
      yPosition: eventContentCenterY,
      // Store original event date for unique key generation
      originalDate: event.date,
      index,
    };
  }).filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.date === value.date // Only keep unique date strings to avoid clutter
    ))
  );

  // Group events by formatted date, keeping track of original index
  const eventsByDate: { [date: string]: { event: typeof allEvents[0], originalIndex: number }[] } = {};
  allEvents.forEach((event, index) => {
    const dateKey = formatDateForAxis(event.date);
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    eventsByDate[dateKey].push({ event, originalIndex: index });
  });

  return (
    <View style={{ flex: 1, flexDirection: 'row', paddingTop: ROOT_VIEW_PADDING_TOP }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: height / 3,
          width: width,
        }}
      >
        {/* Render date separators and their events together */}
        {Object.keys(eventsByDate).map((dateKey) => (
          <View key={dateKey + '-group'}>
            {/* Date Separator */}
            <View
              style={{
                width: '100%',
                paddingTop: 32,
                paddingBottom: 8,
                alignItems: 'center',
                flexDirection: 'row',
                position: 'relative',
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#D1D5DB', marginRight: 8, marginLeft: 16 }} />
              <Text style={{
                color: 'black',
                fontSize: 13,
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.9)',
                paddingHorizontal: 8,
                borderRadius: 6,
                zIndex: 2,
              }}>{dateKey}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#D1D5DB', marginLeft: 8, marginRight: 16 }} />
            </View>
            {/* Events for this date */}
            {eventsByDate[dateKey].map(({ event, originalIndex }) => {
              const isSubject1 = event.isSubject1;
              const itemStyle: ViewStyle = {
                width: ITEM_WIDTH,
                position: 'relative',
                marginBottom: 20,
                alignSelf: isSubject1 ? 'flex-start' : 'flex-end',
                marginHorizontal: HORIZONTAL_PADDING,
              };
              return (
                <Animated.View
                  key={`event-${event.id}-${originalIndex}-${isSubject1}`}
                  style={[
                    itemStyle,
                    eventAnimatedStyle(originalIndex),
                    { zIndex: 2 }
                  ]}
                >
                  <TimelineEventFixable
                    event={event}
                    index={originalIndex}
                    activeIndex={activeIndex}
                    side={isSubject1 ? 'left' : 'right'}
                    color={isSubject1 ? subject1Color.primary : subject2Color.primary}
                    textColor={isSubject1 ? subject1Color.text : subject2Color.text}
                    lightColor={isSubject1 ? subject1Color.light : subject2Color.light}
                    onPress={(e) => onEventPress(e, isSubject1)}
                    simplified={simplifiedMode}
                  />
                </Animated.View>
              );
            })}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

export default WheelTimeline;
