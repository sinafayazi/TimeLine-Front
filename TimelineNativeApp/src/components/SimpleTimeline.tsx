import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Event, Subject } from '../types';
import OptimizedImage from './OptimizedImage';
import { getCategoryFallback } from '../utils/imageFallbacks';

interface SimpleTimelineProps {
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
 * A simplified timeline component that's ultra-safe and renders events in a flat list
 * This is an emergency fallback when the animated VerticalTimeline fails
 */
const SimpleTimeline: React.FC<SimpleTimelineProps> = ({
  subject1,
  subject2,
  subject1Color,
  subject2Color,
  onEventPress
}) => {
  // Safety check for required data
  if (!subject1 || !subject2 || !Array.isArray(subject1.events) || !Array.isArray(subject2.events)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Invalid Timeline Data</Text>
        <Text style={styles.errorMessage}>Could not load timeline data.</Text>
      </View>
    );
  }
  
  // Get all events and sort by date
  const allEvents: (Event & { isFromSubject1: boolean })[] = [
    ...subject1.events.map(event => ({ ...event, isFromSubject1: true })),
    ...subject2.events.map(event => ({ ...event, isFromSubject1: false }))
  ]
  .filter(event => event && typeof event === 'object' && event.date) // Validate events
  .sort((a, b) => {
    try {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } catch (e) {
      return 0;
    }
  });
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.warn('Date formatting error:', e);
      return 'Invalid date';
    }
  };
  
  // No events to show
  if (allEvents.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Events</Text>
        <Text style={styles.errorMessage}>No timeline events found for these subjects.</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Timeline Events</Text>
      <Text style={styles.subtitle}>Sorted by date (oldest first)</Text>
      
      {allEvents.map((event, index) => {
        // Safe event data access with defaults
        const title = event.title || 'Untitled Event';
        const date = event.date || '';
        const description = event.description || 'No description available';
        
        // Determine color based on which subject the event belongs to
        const color = event.isFromSubject1 ? subject1Color : subject2Color;
        
        // Get fallback image based on category
        const fallbackImage = getCategoryFallback(event.category || 'default');
        
        return (
          <TouchableOpacity 
            key={`event-${event.id || index}`}
            style={[
              styles.eventCard, 
              { borderLeftColor: color.primary.includes('bg-') ? '#3b82f6' : color.primary }
            ]}
            onPress={() => onEventPress(event, event.isFromSubject1 ? subject1Color.primary : subject2Color.primary)}
            activeOpacity={0.7}
          >
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{title}</Text>
              <View 
                style={[
                  styles.sourceBadge,
                  { backgroundColor: color.primary.includes('bg-') ? '#3b82f6' : color.primary }
                ]}
              >
                <Text style={styles.sourceBadgeText}>
                  {event.isFromSubject1 ? subject1.name : subject2.name}
                </Text>
              </View>
            </View>
            
            <Text style={styles.eventDate}>{formatDate(date)}</Text>
            
            <OptimizedImage
              source={event.mainImage || ''}
              style={styles.eventImage}
              resizeMode="cover"
              placeholderColor="#e2e8f0"
              fallbackImage={fallbackImage}
              fallbackText={title}
            />
            
            <Text style={styles.eventDescription} numberOfLines={3}>
              {description}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginRight: 8,
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sourceBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  eventDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  eventImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  spacer: {
    height: 60,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default React.memo(SimpleTimeline);
