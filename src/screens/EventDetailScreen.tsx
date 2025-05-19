import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MOCK_SUBJECTS } from '../data/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import OptimizedImage from '../components/OptimizedImage';
import ErrorBoundary from '../components/ErrorBoundary';
import { getCategoryFallback } from '../utils/imageFallbacks';
import imagePreloader from '../utils/imagePreloader';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

const { width } = Dimensions.get('window');

// The main EventDetailScreen component
const EventDetailScreenContent = ({ route, navigation }: Props) => {
  const { eventId, subjectColor } = route.params;

  // Find event safely with validation
  const event = useMemo(() => {
    try {
      const foundEvent = MOCK_SUBJECTS.flatMap(subject => subject.events).find(e => e?.id === eventId);
      
      // Validate that event is not undefined and has required properties
      if (!foundEvent || typeof foundEvent !== 'object') {
        console.warn('Event not found:', eventId);
        return null;
      }
      
      if (!foundEvent.title || !foundEvent.date) {
        console.warn('Event missing required properties:', foundEvent);
        return null;
      }
      
      return foundEvent;
    } catch (error) {
      console.error('Error finding event:', error);
      return null;
    }
  }, [eventId]);
  
  // Preload images when component mounts, with validation
  useEffect(() => {
    if (event) {
      try {
        const imagesToPreload: string[] = [];
        
        // Validate and add main image if available
        if (event.mainImage && typeof event.mainImage === 'string' && event.mainImage.trim()) {
          // For remote URLs, validate URL format
          if (event.mainImage.startsWith('http')) {
            try {
              new URL(event.mainImage);
              imagesToPreload.push(event.mainImage);
            } catch (e) {
              console.warn('Invalid mainImage URL in event:', event.id);
            }
          } else {
            // Local paths
            imagesToPreload.push(event.mainImage);
          }
        }
        
        // Include additional images if available, with validation
        if (event.images && Array.isArray(event.images) && event.images.length > 0) {
          event.images.forEach(img => {
            if (img && typeof img === 'string' && img.trim()) {
              if (img.startsWith('http')) {
                try {
                  new URL(img);
                  imagesToPreload.push(img);
                } catch (e) {
                  console.warn('Invalid image URL in event.images:', img);
                }
              } else {
                imagesToPreload.push(img);
              }
            }
          });
        }
        
        // Preload all collected valid images
        if (imagesToPreload.length > 0) {
          imagePreloader.preloadImages(imagesToPreload);
        }
      } catch (error) {
        console.warn('Error preloading event images:', error);
      }
    }
  }, [event]);

  if (!event) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-4 bg-gray-100">
        <Text className="text-xl text-gray-800">Event not found</Text>
        <TouchableOpacity
          className="mt-6 bg-blue-500 p-3 rounded-lg active:bg-blue-600"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white text-center font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Text color based on the subject color
  const textColor = subjectColor.replace('bg-', 'text-');
  // Color for header based on subject
  const headerColor = subjectColor.replace('-500', '-600');
  // Light color for background
  const lightColor = subjectColor.replace('-500', '-50');

  const formatDate = (dateString: string) => {
    try {
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

  // Get the appropriate fallback image based on category
  const fallbackImage = useMemo(() => {
    try {
      return getCategoryFallback(event.category || 'default');
    } catch (error) {
      console.warn('Error getting fallback image:', error);
      return require('../../assets/fallbacks/default.png');
    }
  }, [event.category]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className={`${headerColor} p-4 pb-6`}>
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/30 rounded-full p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-white font-bold">←</Text>
          </TouchableOpacity>
          
          <Text className="text-white font-bold text-xl flex-1 text-center mx-2" numberOfLines={1}>
            {event.title}
          </Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>
    
    <ScrollView className={`${lightColor}`} bounces={false} showsVerticalScrollIndicator={false}>
      {/* Main Image with Animation and fallback */}
      <Animated.View entering={FadeIn.duration(600).delay(300)}>
        <OptimizedImage 
          source={event.mainImage || ''} 
          style={{ width: '100%', height: 220 }}
          resizeMode="cover"
          loadingIndicator={true}
          fallbackImage={fallbackImage}
          fallbackText={event.title || "Event"}
          placeholderColor="#e2e8f0"
        />
      </Animated.View>
      
      {/* Date Information */}
      <Animated.View 
        entering={SlideInRight.duration(500).delay(200)}
        className="px-4 py-3 bg-white"
      >
        <Text className="text-gray-500 text-sm">
          {event.endDate 
            ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
            : formatDate(event.date)
          }
        </Text>
      </Animated.View>
      
      {/* Description */}
      <Animated.View 
        entering={SlideInRight.duration(500).delay(400)}
        className="px-4 py-5 bg-white"
      >
        <Text className="text-gray-700 leading-6">{event.description}</Text>
      </Animated.View>
      
      {/* Additional Images */}
      {event.images && event.images.length > 0 && (
        <Animated.View 
          entering={SlideInRight.duration(500).delay(600)}
          className="px-4 py-2 mt-2 bg-white"
        >
          <Text className={`${textColor} font-bold mb-2`}>Gallery</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {event.images.map((image, index) => (
              <Animated.View 
                key={`image-${index}`}
                entering={FadeIn.duration(600).delay(800 + index * 200)}
                className="mr-3"
              >
                <OptimizedImage
                  source={image || ''}
                  style={{ width: 140, height: 140, borderRadius: 8 }}
                  resizeMode="cover"
                  placeholderColor="#e2e8f0"
                  fallbackImage={fallbackImage}
                  fallbackText="Gallery Image"
                  loadingIndicator={true}
                />
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      )}
      
      {/* Bottom Spacing */}
      <View style={{ height: 40 }} />
    </ScrollView>
  </SafeAreaView>
  );
};

// Main screen component wrapped with error boundary
const EventDetailScreen = ({ route, navigation }: Props) => {
  return (
    <ErrorBoundary
      fallback={() => (
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content" />
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-xl font-bold text-red-600 mb-2">Something Went Wrong</Text>
            <Text className="text-base text-gray-600 text-center mb-4">
              There was an error displaying this event.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="px-4 py-2 bg-blue-500 rounded-lg"
            >
              <Text className="text-white font-medium">Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    >
      <EventDetailScreenContent route={route} navigation={navigation} />
    </ErrorBoundary>
  );
};

export default EventDetailScreen;
