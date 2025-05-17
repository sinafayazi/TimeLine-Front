import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MOCK_SUBJECTS } from '../data/mockData';
import { Event } from '../types';
import WheelTimeline from '../components/WheelTimeline'; // Corrected import
import EventDetailModal from '../components/EventDetailModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { getComparisonColors } from '../utils/colorUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'WheelDateTimeline'>;

const WheelDateTimelineScreen = ({ route, navigation }: Props) => {
  const { subjectId1, subjectId2 } = route.params;
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSubjectColor, setSelectedSubjectColor] = useState<string>('bg-blue-500');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Find subjects from mock data with safety checks
  const subject1 = MOCK_SUBJECTS.find(subject => subject && subject.id === subjectId1);
  const subject2 = MOCK_SUBJECTS.find(subject => subject && subject.id === subjectId2);

  // Get random but different colors for the two subjects
  const { subject1: subject1Color, subject2: subject2Color } = getComparisonColors();

  // Handle event press to show details with enhanced validation
  const handleEventPress = useCallback((event: Event, isSubject1: boolean) => {
    try {
      // Validate event before setting state
      if (!event || typeof event !== 'object') {
        console.warn('Invalid event passed to handleEventPress:', event);
        return;
      }

      // Check required fields exist and are valid
      if (!event.id || !event.title || !event.date) {
        console.warn('Event missing required properties:', event);
        return;
      }

      // Set the event after validation and determine the color based on which subject the event belongs to
      setSelectedEvent({ ...event }); // Create a shallow copy for safety
      setSelectedSubjectColor(isSubject1 ? subject1Color.primary : subject2Color.primary);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error in handleEventPress:', error);
      setError('An error occurred when trying to view event details.');
    }
  }, [subject1Color, subject2Color]);

  // Handle modal close with error handling
  const handleModalClose = useCallback(() => {
    try {
      setIsModalVisible(false);
      // Wait for modal animation to finish before clearing the event
      setTimeout(() => {
        setSelectedEvent(null);
      }, 300);
    } catch (error) {
      console.error('Error in handleModalClose:', error);
    }
  }, []);
  
  // Handle back button press
  const handleBackPress = useCallback(() => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Error in handleBackPress:', error);
    }
  }, [navigation]);

  // Clear error when it's shown
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => setError(null) }
      ]);
    }
  }, [error]);

  // Safely render alternative content if subjects not found
  if (!subject1 || !subject2) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-xl text-gray-800">Subjects not found</Text>
        <TouchableOpacity 
          onPress={handleBackPress}
          className="mt-4 p-3 rounded-lg bg-blue-500"
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Make safe copies of subjects to prevent mutation issues
  const safeSubject1 = {
    ...subject1,
    events: subject1.events
      ? subject1.events
          .filter(event => event && typeof event === 'object')
          .map(event => ({...event}))
      : []
  };

  const safeSubject2 = {
    ...subject2,
    events: subject2.events
      ? subject2.events
          .filter(event => event && typeof event === 'object')
          .map(event => ({...event}))
      : []
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="flex-row justify-between items-center p-4 bg-white shadow-sm">
        <TouchableOpacity 
          onPress={handleBackPress}
          className="p-2 rounded-full bg-gray-100"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-lg font-semibold">←</Text>
        </TouchableOpacity>
        
        <Text className="text-lg font-bold text-gray-800">Wheel Timeline</Text>
      </View>

      <View className="flex-row justify-center items-center p-2 mb-2">
        {/* Subject 1 indicator */}
        <View
          className={`px-3 py-1 mr-2 rounded-full ${subject1Color.primary}`}
        >
          <Text className="text-white font-semibold text-xs">{safeSubject1.name}</Text>
        </View>
        
        <Text className="text-gray-700">vs</Text>
        
        {/* Subject 2 indicator */}
        <View
          className={`px-3 py-1 ml-2 rounded-full ${subject2Color.primary}`}
        >
          <Text className="text-white font-semibold text-xs">{safeSubject2.name}</Text>
        </View>
      </View>
      
      <View className="flex-1">
        <ErrorBoundary
          onError={(error) => {
            console.error('Timeline error caught by boundary:', error);
            setError('There was a problem rendering the timeline. Please try again.');
          }}
          fallback={
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-lg font-bold text-red-600 mb-2">Timeline Error</Text>
              <Text className="text-sm text-gray-700 mb-4 text-center">
                There was a problem displaying the timeline. Try selecting different subjects.
              </Text>
              <TouchableOpacity 
                onPress={handleBackPress}
                className="px-4 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white font-medium">Go Back</Text>
              </TouchableOpacity>
            </View>
          }
        >
          <WheelTimeline // Corrected component name
            subject1={safeSubject1}
            subject2={safeSubject2}
            subject1Color={subject1Color}
            subject2Color={subject2Color}
            onEventPress={handleEventPress}
          />
        </ErrorBoundary>
      </View>

      {/* Event Detail Modal - only render if we have a valid selected event */}
      {selectedEvent && isModalVisible && (
        <EventDetailModal
          event={selectedEvent}
          subjectColor={selectedSubjectColor}
          isVisible={isModalVisible}
          onClose={handleModalClose}
        />
      )}
    </SafeAreaView>
  );
};

export default WheelDateTimelineScreen;
