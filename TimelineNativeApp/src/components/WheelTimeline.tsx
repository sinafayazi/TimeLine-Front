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
import TimelineEventFixable from './TimelineEventFixable';
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
const EFFECTIVE_ITEM_CONTENT_HEIGHT = 150; // Assumed height of the event content itself
const ITEM_MARGIN_BOTTOM = 20; // Margin below each event item in the list
const TOTAL_ITEM_STEP_HEIGHT = EFFECTIVE_ITEM_CONTENT_HEIGHT + ITEM_MARGIN_BOTTOM; // Total vertical space one item occupies

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
    // Example: "Jan 2023"
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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
    // Use TOTAL_ITEM_STEP_HEIGHT for consistent animation inputRange
    const inputRange = [
      (index - 1) * TOTAL_ITEM_STEP_HEIGHT,
      index * TOTAL_ITEM_STEP_HEIGHT,
      (index + 1) * TOTAL_ITEM_STEP_HEIGHT,
    ];

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.85, 1, 0.85], // Slightly less aggressive scaling
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.6, 1, 0.6], // Slightly less aggressive opacity
      Extrapolation.CLAMP
    );

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
    // Calculate yPosition to align with the center of the event item's content area
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
    };
  }).filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.date === value.date // Only keep unique date strings to avoid clutter
    ))
  );


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
        {/* Vertical Axis Line - Now inside ScrollView */}
        <Svg
          height={allEvents.length * TOTAL_ITEM_STEP_HEIGHT + 2 * (height / 3)} // Adjusted height to match content
          width={AXIS_WIDTH}
          style={{
            position: 'absolute',
            left: width / 2 - AXIS_WIDTH / 2,
            top: 0, // Starts from the top of the scroll content
            bottom: 0,
            zIndex: 0,
          }}
        >
          <Line
            x1={AXIS_WIDTH / 2}
            y1="0"
            x2={AXIS_WIDTH / 2}
            y2="100%" // Will span the height of the Svg container
            stroke="darkgrey"
            strokeWidth="2"
          />
        </Svg>

        {/* Axis Dates - Now inside ScrollView */}
        <View style={{
          position: 'absolute', // Still absolute, but relative to ScrollView content
          left: 0, // Align with the left edge of the ScrollView
          right: 0, // Align with the right edge of the ScrollView
          top: 0, // Align with the top of the scroll content
          height: '100%', // Spans the height of the scroll content
          zIndex: 1, // Ensure dates are above the line but below events if they overlap
          alignItems: 'center', // Center children horizontally
        }}>
          {dateTicks.map((tick) => (
            <View
              key={`${tick.originalDate}-${tick.yPosition}`} // Use a more unique key
              style={{
                position: 'absolute',
                top: tick.yPosition - 10, // Adjust to vertically center the text (assuming text height ~20)
                width: 100, // Give some width to the text container
                alignItems: 'center', // Center text inside this view
              }}
            >
              <Text style={{
                color: 'black', // Ensure text is visible
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center', // Center the text content
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // Optional: add a slight background for readability
                paddingHorizontal: 4,
                borderRadius: 4,
              }}>
                {tick.date}
              </Text>
            </View>
          ))}
        </View>

        {allEvents.map((event, index) => {
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
              key={`event-${event.id}-${index}-${isSubject1}`}
              style={[
                itemStyle,
                eventAnimatedStyle(index),
                { zIndex: 2 } // Ensure events are above the axis and dates
              ]}
            >
              <TimelineEventFixable
                event={event}
                index={index}
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
      </Animated.ScrollView>
    </View>
  );
};

export default WheelTimeline;
