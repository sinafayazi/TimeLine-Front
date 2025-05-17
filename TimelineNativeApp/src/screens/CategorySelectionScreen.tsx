import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MOCK_CATEGORIES } from '../data/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = NativeStackScreenProps<RootStackParamList, 'CategorySelection'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

const CATEGORY_IMAGES = {
  '1': 'https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=800', // History
  '2': 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800', // Science
  '3': 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800', // Technology
  '4': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800', // Art
  '5': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800', // Sports
  '6': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', // Music
};

const CategorySelectionScreen = ({ route, navigation }: Props) => {
  const { selectionStage, subjectId1 } = route.params || { selectionStage: 1 };

  const handleSelectCategory = (categoryId: string) => {
    navigation.push('SubjectSelection', {
      categoryId,
      selectionStage,
      subjectId1,
    });
  };

  const renderCategory = ({ item, index }: { item: typeof MOCK_CATEGORIES[0]; index: number }) => {
    // Get corresponding image based on category ID
    const imageUrl = (CATEGORY_IMAGES as Record<string, string>)[item.id] || 
      'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800';
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).duration(400)}
        className="mx-2 mb-4"
      >
        <TouchableOpacity
          className="overflow-hidden rounded-xl shadow-md"
          onPress={() => handleSelectCategory(item.id)}
          activeOpacity={0.8}
          style={{ width: CARD_WIDTH }}
        >
          <Image 
            source={{ uri: imageUrl }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className={`py-3 ${item.color}`}>
            <Text className="text-white text-center font-bold text-lg">{item.name}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Text className="text-2xl font-bold text-center my-6 text-gray-800 px-4">
        Select Category for Subject {selectionStage}
        {selectionStage === 2 && " (Compare)"}
      </Text>
      
      <Text className="text-gray-500 text-center px-8 mb-6">
        Choose a category to view and compare historical events across different subjects
      </Text>

      <FlatList
        data={MOCK_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </SafeAreaView>
  );
};

export default CategorySelectionScreen;
