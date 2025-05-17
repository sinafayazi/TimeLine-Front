import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MOCK_SUBJECTS } from '../data/mockData';
import { Event } from '../types';
import WheelTimeline from '../components/WheelTimeline'; // Import the WheelTimeline component
import EventDetailModal from '../components/EventDetailModal';
import ErrorBoundary from '../components/ErrorBoundary';
import { getComparisonColors } from '../utils/colorUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'ComparisonTimeline'>;

const ComparisonTimelineScreen = ({ route, navigation }: Props) => {
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
  }, []);

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
      <View className="p-4 flex-row justify-between items-center bg-white shadow-sm">
        <TouchableOpacity onPress={handleBackPress} className="p-2">
          <Text className="text-blue-500 text-lg">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-700">Timeline Comparison</Text>
        <View className="w-10" />{/* Spacer */}
      </View>

      {error && (
        <View className="p-4 bg-red-100 border border-red-400 rounded-md m-4">
          <Text className="text-red-700 font-semibold">An Error Occurred</Text>
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <WheelTimeline
          subject1={safeSubject1}
          subject2={safeSubject2}
          subject1Color={subject1Color}
          subject2Color={subject2Color}
          onEventPress={handleEventPress}
        />
      </View>

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

export default ComparisonTimelineScreen;
