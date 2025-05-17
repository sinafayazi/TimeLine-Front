import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import VerticalTimeline from './VerticalTimeline';
import SimpleTimeline from './SimpleTimeline';
import WheelTimeline from './WheelTimeline';
import { Event, Subject } from '../types';

interface SafeVerticalTimelineProps {
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

/**
 * A wrapper component for timeline visualization that adds additional error handling
 * and provides a fallback UI if the timeline fails to render
 */
const SafeVerticalTimeline: React.FC<SafeVerticalTimelineProps> = (props) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [useSimpleTimeline, setUseSimpleTimeline] = useState(false);
  const [timelineType, setTimelineType] = useState<'vertical' | 'wheel' | 'simple'>('wheel'); // Default to wheel view
  
  // Reset error state when props change
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
  }, [props.subject1, props.subject2]);
  
  // Safety timeout: switch to simple timeline after 7 seconds to prevent crash
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      // If still on complex timeline after 7 seconds, switch to simple
      if (timelineType !== 'simple') {
        console.log('Safety timeout: switching to SimpleTimeline');
        setTimelineType('simple');
      }
    }, 7000);
    
    return () => clearTimeout(safetyTimer);
  }, [timelineType]);
  
  // Safety check for required data
  const isValid = React.useMemo(() => {
    try {
      // Validate subjects
      if (!props.subject1 || !props.subject2) return false;
      
      // Check if subjects have events array
      if (!Array.isArray(props.subject1.events) || !Array.isArray(props.subject2.events)) return false;
      
      // Check if there are any events to display
      if (props.subject1.events.length === 0 && props.subject2.events.length === 0) {
        setErrorMessage('No events found to display in the timeline.');
        return false;
      }
      
      // Check if colors are provided
      if (!props.subject1Color || !props.subject2Color) return false;
      
      return true;
    } catch (error) {
      console.error('Error validating timeline data:', error);
      setErrorMessage('Invalid timeline data provided.');
      return false;
    }
  }, [props.subject1, props.subject2, props.subject1Color, props.subject2Color]);
  
  // Handle reset attempt
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage('');
  };
  
  // Safely prepare subject data
  const safeSubject1 = useMemo(() => {
    if (!props.subject1 || typeof props.subject1 !== 'object') {
      return { id: 'invalid1', name: 'Unknown', categoryId: 'unknown', description: '', events: [] };
    }
    
    // Ensure events is an array and filter out invalid events
    const safeEvents = Array.isArray(props.subject1.events) 
      ? props.subject1.events.filter(event => event && typeof event === 'object' && event.id && event.title)
      : [];
      
    return {
      ...props.subject1,
      categoryId: props.subject1.categoryId || 'unknown', // Ensure categoryId is present
      events: safeEvents
    };
  }, [props.subject1]);
  
  const safeSubject2 = useMemo(() => {
    if (!props.subject2 || typeof props.subject2 !== 'object') {
      return { id: 'invalid2', name: 'Unknown', categoryId: 'unknown', description: '', events: [] };
    }
    
    // Ensure events is an array and filter out invalid events
    const safeEvents = Array.isArray(props.subject2.events) 
      ? props.subject2.events.filter(event => event && typeof event === 'object' && event.id && event.title)
      : [];
      
    return {
      ...props.subject2,
      categoryId: props.subject2.categoryId || 'unknown', // Ensure categoryId is present
      events: safeEvents
    };
  }, [props.subject2]);
  
  // If validation checks failed, show error UI
  if (!isValid) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg font-bold text-amber-600 mb-2">Timeline Data Issue</Text>
        <Text className="text-sm text-gray-700 mb-4 text-center">
          {errorMessage || 'Could not load timeline data. Please try different subjects.'}
        </Text>
        <TouchableOpacity 
          onPress={handleRetry}
          className="px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // If previous render had an error, show error UI
  if (hasError) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg font-bold text-red-600 mb-2">Timeline Error</Text>
        <Text className="text-sm text-gray-700 mb-4 text-center">
          Something went wrong while rendering the timeline. 
        </Text>
        <TouchableOpacity 
          onPress={handleRetry}
          className="px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Try to render the timeline, catching any errors
  try {
    // If we've decided to use the simple timeline, render it
    if (useSimpleTimeline) {
      return (
        <SimpleTimeline
          subject1={safeSubject1}
          subject2={safeSubject2}
          subject1Color={props.subject1Color}
          subject2Color={props.subject2Color}
          onEventPress={props.onEventPress}
        />
      );
    }

    return (
      <>
        <TouchableOpacity 
          onPress={() => setUseSimpleTimeline(true)}
          className="absolute top-2 right-2 z-10 px-2 py-1 bg-gray-200 rounded-md opacity-70"
        >
          <Text className="text-xs text-gray-800">Simple View</Text>
        </TouchableOpacity>
        
        <VerticalTimeline
          subject1={safeSubject1}
          subject2={safeSubject2}
          subject1Color={props.subject1Color}
          subject2Color={props.subject2Color}
          onEventPress={props.onEventPress}
        />
      </>
    );
  } catch (error) {
    // Update state to show error UI on next render
    console.error('Error rendering timeline:', error);
    setHasError(true);
    setErrorMessage('An error occurred while rendering the timeline.');
    
    // Return simple timeline as fallback
    return (
      <SimpleTimeline
        subject1={safeSubject1}
        subject2={safeSubject2}
        subject1Color={props.subject1Color}
        subject2Color={props.subject2Color}
        onEventPress={props.onEventPress}
      />
    );
  }
};

export default React.memo(SafeVerticalTimeline);
