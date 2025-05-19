import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategorySelectionScreen from '../screens/CategorySelectionScreen';
import SubjectSelectionScreen from '../screens/SubjectSelectionScreen';
import ComparisonTimelineScreen from '../screens/ComparisonTimelineScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import WheelDateTimelineScreen from '../screens/WheelDateTimelineScreen'; // Import the screen

// Define the ParamList for type safety
export type RootStackParamList = {
  CategorySelection: { selectionStage: 1 | 2; subjectId1?: string }; // Track stage and first subject
  SubjectSelection: {
    categoryId: string;
    selectionStage: 1 | 2;
    subjectId1?: string; // Pass subjectId1 if stage is 2
  };
  ComparisonTimeline: { subjectId1: string; subjectId2: string };
  EventDetail: { eventId: string; subjectColor: string };
  WheelDateTimeline: { subjectId1: string; subjectId2: string }; // Added WheelDateTimeline
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CategorySelection"
        screenOptions={{
          headerShown: false,
          // if ios use 'ios_from_right' for iOS, 'slide_from_right' for Android
           animation: Platform.OS === 'ios' ? 'ios_from_right' : 'slide_from_right',
          contentStyle: { backgroundColor: 'white' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="CategorySelection"
          component={CategorySelectionScreen}
          options={({ route }) => ({
            title:
              route.params?.selectionStage === 2
                ? 'Select Category (Comparing)'
                : 'Select Category',
            headerShown: true,
          })}
          initialParams={{ selectionStage: 1 }}
        />
        <Stack.Screen
          name="SubjectSelection"
          component={SubjectSelectionScreen}
          options={({ route }) => ({
            title: `Select Subject for ${route.params.categoryId}`,
            headerShown: true,
          })}
        />
        <Stack.Screen
          name="ComparisonTimeline"
          component={ComparisonTimelineScreen}
          options={{
            title: 'Timeline Comparison',
            headerShown: false,
            gestureEnabled: true,
            
          }}
        />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
        />
        <Stack.Screen
          name="WheelDateTimeline"
          component={WheelDateTimelineScreen}
          options={{
            title: 'Wheel Timeline',
            headerShown: false, // Or true if you want a header
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
