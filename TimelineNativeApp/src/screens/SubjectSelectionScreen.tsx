import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MOCK_SUBJECTS, MOCK_CATEGORIES } from '../data/mockData';
import { Subject } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

// Subject thumbnail images
const SUBJECT_IMAGES = {
  '1': 'https://images.unsplash.com/photo-1580428180098-24b353d7e9d9?w=800', // WW2
  '2': 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800', // Physics
  '3': 'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?w=800', // AI
  '4': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', // Renaissance
  '5': 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=800', // Olympics
  '6': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', // Classical
  '7': 'https://images.unsplash.com/photo-1590622783586-e5d6bf28ef86?w=800', // American Rev
  '8': 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800', // Chemistry
  '9': 'https://images.unsplash.com/photo-1519408469771-2586093c3f14?w=800', // Space
  '10': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', // Modern Art
  '11': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800', // Football
  '12': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', // Jazz
};

type Props = NativeStackScreenProps<RootStackParamList, 'SubjectSelection'>;

const SubjectSelectionScreen = ({ route, navigation }: Props) => {
  const { categoryId, selectionStage, subjectId1 } = route.params;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categoryColor, setCategoryColor] = useState<string>('bg-gray-500');
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    // Filter subjects by category ID
    setSubjects(MOCK_SUBJECTS.filter(s => s.categoryId === categoryId));

    // Get category details
    const category = MOCK_CATEGORIES.find(c => c.id === categoryId);
    setCategoryColor(category?.color || 'bg-gray-500');
    setCategoryName(category?.name || '');
  }, [categoryId]);

  const handleSelectSubject = (selectedSubjectId: string) => {
    if (selectionStage === 1) {
      // Navigate to CategorySelection for the second subject, passing the first subject's ID
      navigation.push('CategorySelection', {
        selectionStage: 2, // Set stage to 2 for selecting the second category/subject
        subjectId1: selectedSubjectId,
      });
    } else if (selectionStage === 2 && subjectId1) {
      // Navigate to ComparisonTimeline with both subject IDs
      navigation.navigate('ComparisonTimeline', {
        subjectId1: subjectId1, // The first subject selected
        subjectId2: selectedSubjectId, // The second subject just selected
      });
    }
  };

  const renderSubject = ({ item, index }: { item: Subject; index: number }) => {
    // Get image for this subject or use default
    const imageUrl = (SUBJECT_IMAGES as Record<string, string>)[item.id] || 
      'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800';
      
    // Create color styles based on category color
    const borderColor = categoryColor.replace('bg-', 'border-').replace('-500', '-600');
    const bgColor = categoryColor.replace('bg-', 'bg-').replace('-500', '-50');
    const textColor = categoryColor.replace('bg-', 'text-').replace('-500', '-800');
    
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 100).duration(400)}
        className="w-full mb-4"
      >
        <TouchableOpacity
          className={`flex-row items-center p-3 rounded-xl ${bgColor} border-2 ${borderColor} shadow-sm`}
          onPress={() => handleSelectSubject(item.id)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: imageUrl }}
            className="w-16 h-16 rounded-lg"
            resizeMode="cover"
          />
          
          <View className="flex-1 ml-4">
            <Text className={`text-lg font-bold ${textColor}`}>
              {item.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {item.events.length} events
            </Text>
          </View>
          
          <Text className="text-gray-400">→</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className={`p-4 ${categoryColor}`}>
        <Animated.Text 
          entering={FadeIn.duration(600)}
          className="text-white text-2xl font-bold text-center"
        >
          {categoryName}
        </Animated.Text>
        <Text className="text-white opacity-80 text-center mt-1">
          Select subject {selectionStage} for comparison
        </Text>
      </View>
      
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubject}
        contentContainerStyle={{ padding: 16 }}
      />
      
      {selectionStage === 2 && (
        <View className="p-4 bg-white border-t border-gray-200">
          <TouchableOpacity 
            className="p-3 bg-gray-200 rounded-lg"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-center font-semibold text-gray-700">
              Back to Categories
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SubjectSelectionScreen;
