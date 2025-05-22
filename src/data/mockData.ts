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

// Helper to create ISO-like date strings, handling BC years
// For simplicity in mock data, BC years are represented as negative.
// Real date parsing will need to be more robust.
const createDateString = (year: number, month: number = 1, day: number = 1): string => {
  const absYear = Math.abs(year);
  const yearString = absYear.toString().padStart(4, '0');
  const monthString = month.toString().padStart(2, '0');
  const dayString = day.toString().padStart(2, '0');
  return `${year < 0 ? '-' : ''}${yearString}-${monthString}-${dayString}T00:00:00Z`;
};

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
  {
    id: 'iran-history',
    name: 'History of Iran',
    categoryId: 'history',
    events: [
      {
        id: 'kura-araxes',
        title: 'Kura–Araxes Culture',
        description: 'A Bronze Age culture that stretched across the Caucasus and into northwestern Iran.',
        date: createDateString(-3400), // 3400 BC
        endDate: createDateString(-2000), // 2000 BC
        mainImage: 'fallbacks/history.png', // Placeholder
        category: 'history',
      },
      {
        id: 'median-achaemenid',
        title: 'Median and Achaemenid Empires',
        description: 'The Median Empire followed by the Achaemenid Empire, founded by Cyrus the Great, which became the largest empire in ancient history.',
        date: createDateString(-678), // 678 BC
        endDate: createDateString(-330), // 330 BC
        mainImage: 'fallbacks/history.png',
        category: 'history',
      },
      {
        id: 'parthian-empire',
        title: 'Parthian Empire',
        description: 'A major Iranian political and cultural power in ancient Iran and Iraq.',
        date: createDateString(-247), // 247 BC (Corrected from -248 based on common sources)
        endDate: createDateString(224), // 224 AD
        mainImage: 'fallbacks/history.png',
        category: 'history',
      },
      {
        id: 'sasanian-empire',
        title: 'Sasanian Empire',
        description: 'The last Iranian empire before the rise of Islam, considered a peak of Persian civilization.',
        date: createDateString(224), // 224 AD
        endDate: createDateString(651), // 651 AD
        mainImage: 'fallbacks/history.png',
        category: 'history',
      },
      {
        id: 'safavid-empire',
        title: 'Safavid Empire',
        description: 'One of the most significant ruling dynasties of Iran, established Shia Islam as the state religion.',
        date: createDateString(1501), // 1501 AD
        endDate: createDateString(1736), // 1736 AD
        mainImage: 'fallbacks/history.png',
        category: 'history',
      },
      {
        id: 'qajar-dynasty',
        title: 'Qajar Dynasty',
        description: 'The ruling dynasty of Iran from 1789 to 1925.',
        date: createDateString(1789), // Corrected from 1796 for consistency with common start of dynasty
        endDate: createDateString(1925), // 1925 AD
        mainImage: 'fallbacks/history.png',
        category: 'history',
      },
      {
        id: 'pahlavi-era',
        title: 'Pahlavi Era',
        description: 'The reign of the Pahlavi dynasty, from Reza Shah to Mohammad Reza Pahlavi.',
        date: createDateString(1925), // 1925 AD
        endDate: createDateString(1979), // 1979 AD
        mainImage: 'fallbacks/history.png',
        category: 'history',
      },
    ],
  },
  {
    id: 'history_of_iran',
    name: 'History of Iran',
    categoryId: 'history',
    description: 'A brief overview of significant periods in the history of Iran.',
    events: [
      {
        id: 'sasanian_empire',
        title: 'Sasanian Empire',
        description: 'The last Iranian empire before the rise of Islam, ruling from 224 to 651 AD.',
        date: '0224-01-01T00:00:00Z',
        endDate: '0651-01-01T00:00:00Z',
        mainImage: 'placeholder_sasanian.png', // Replace with actual image path or URL
        category: 'history',
      },
      {
        id: 'abbasid_caliphate_persia',
        title: 'Abbasid Caliphate Influence',
        description: 'Period of Abbasid Caliphate rule (750-1258 AD), which saw significant Persian cultural and scientific contributions.',
        date: '0750-01-01T00:00:00Z',
        endDate: '1258-01-01T00:00:00Z',
        mainImage: 'placeholder_abbasid.png',
        category: 'history',
      },
      {
        id: 'seljuk_empire_persia',
        title: 'Seljuk Empire Influence',
        description: 'The Seljuk Empire, a Turco-Persian Sunni Muslim empire, controlled Persia from 1037 to 1194 AD.',
        date: '1037-01-01T00:00:00Z',
        endDate: '1194-01-01T00:00:00Z',
        mainImage: 'placeholder_seljuk.png',
        category: 'history',
      },
      {
        id: 'safavid_empire',
        title: 'Safavid Empire',
        description: 'The Safavid dynasty ruled Iran from 1501 to 1736, establishing Twelver Shia Islam as the official religion.',
        date: '1501-01-01T00:00:00Z',
        endDate: '1736-01-01T00:00:00Z',
        mainImage: 'placeholder_safavid.png',
        category: 'history',
      },
      {
        id: 'qajar_dynasty',
        title: 'Qajar Dynasty',
        description: 'The Qajar dynasty ruled Persia (Iran) from 1789 to 1925.',
        date: '1789-01-01T00:00:00Z',
        endDate: '1925-01-01T00:00:00Z',
        mainImage: 'placeholder_qajar.png',
        category: 'history',
      },
    ],
  }
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

export const getSubjectById = (id: string): Subject | undefined => {
  return MOCK_SUBJECTS.find(subject => subject.id === id);
};
