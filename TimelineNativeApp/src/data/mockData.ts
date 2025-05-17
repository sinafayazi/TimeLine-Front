import axios from 'axios';
import { Category, Subject, Event } from '../types';

const API_BASE_URL = 'https://api.example.com'; // Replace with your API base URL

// Enhanced with more vibrant colors for better visual distinction
export const MOCK_CATEGORIES: Category[] = [
  { id: 'history', name: 'History', color: 'bg-red-500' },
  { id: 'science', name: 'Science', color: 'bg-blue-500' },
  { id: 'art', name: 'Art', color: 'bg-yellow-500' },
  { id: 'technology', name: 'Technology', color: 'bg-green-500' },
  { id: 'literature', name: 'Literature', color: 'bg-purple-500' },
  { id: 'space', name: 'Space Exploration', color: 'bg-indigo-500' },
  { id: 'ancient', name: 'Ancient Civilizations', color: 'bg-orange-500' },
  { id: 'modern', name: 'Modern Era', color: 'bg-pink-500' },
];

// Enhanced mock events with more detailed descriptions and additional images
export const MOCK_SUBJECTS: Subject[] = [
  {
    id: 'roman-empire',
    name: 'Roman Empire',
    categoryId: 'history',
    description: 'The Roman Empire was one of the largest empires in history, covering much of Europe, North Africa, and the Middle East.',
    events: [
      {
        id: 'event-1',
        title: 'Founding of Rome',
        date: '0753-04-21', // Standardized date
        description: 'According to legend, Rome was founded in 753 BC by Romulus.',
        category: 'Foundation',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
      {
        id: 'event-2',
        title: 'Julius Caesar\'s Assassination',
        date: '0044-03-15', // Standardized date
        description: 'Julius Caesar was assassinated on the Ides of March.',
        category: 'Political',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
      {
        id: 'event-3',
        title: 'The Colosseum Opens',
        date: '0080-01-01', // Standardized date
        description: 'The Colosseum, an iconic symbol of Imperial Rome, was opened in 80 AD.',
        category: 'Architecture',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
    ],
  },
  {
    id: 'apollo-missions',
    name: 'Apollo Missions',
    categoryId: 'space',
    description: 'The Apollo program was a series of human spaceflight missions undertaken by NASA, culminating in the first crewed lunar landings.',
    events: [
      {
        id: 'event-25',
        title: 'Apollo 11 Moon Landing',
        date: '1969-07-20',
        description: 'Neil Armstrong and Buzz Aldrin become the first humans to land on the Moon.',
        category: 'Moon Landing',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
      {
        id: 'event-26',
        title: 'Apollo 13: "Houston, we have a problem"',
        date: '1970-04-11',
        description: 'An oxygen tank explodes on Apollo 13, forcing the crew to abort their Moon landing.',
        category: 'Crisis',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
    ],
  },
  {
    id: 'the-internet',
    name: 'The Internet',
    categoryId: 'technology',
    description: 'The Internet is a global system of interconnected computer networks that use the Internet protocol suite (TCP/IP) to link devices worldwide.',
    events: [
      {
        id: 'event-30',
        title: 'ARPANET Transition to TCP/IP',
        date: '1983-01-01',
        description: 'The ARPANET transition to the TCP/IP protocol suite, marking the beginning of the modern Internet.',
        category: 'Networking',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
      {
        id: 'event-31',
        title: 'Domain Name System (DNS) Introduced',
        date: '1984-01-01',
        description: 'The Domain Name System (DNS) is introduced, allowing users to access websites using domain names instead of IP addresses.',
        category: 'Innovation',
        mainImage: 'https://images.unsplash.com/photo-1560807707-8cc77767d783'
      },
    ],
  },
  // ... other subjects can also have mainImage added to their events
];

export const fetchCategories = async () => {
  return MOCK_CATEGORIES;
};

export const fetchSubjects = async (categoryId: string) => {
  const response = await axios.get(`${API_BASE_URL}/categories/${categoryId}/subjects`);
  return response.data;
};

export const fetchEvents = async (subjectId: string) => {
  const response = await axios.get(`${API_BASE_URL}/subjects/${subjectId}/events`);
  return response.data;
};

export const fetchEventDetails = async (eventId: string) => {
  const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
  return response.data;
};

// Function to fetch event details by ID
export const getEventById = (eventId: string): Event | undefined => {
  return MOCK_SUBJECTS.flatMap(subject => subject.events).find(event => event.id === eventId);
};
