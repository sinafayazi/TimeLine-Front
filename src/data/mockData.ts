import axios from 'axios';
import { Category, Subject, Event } from '../types';

const API_BASE_URL = 'https://api.example.com'; // Replace with your API base URL

// Enhanced with more vibrant colors for better visual distinction
export const MOCK_CATEGORIES: Category[] = [
  {
    "id": "history",
    "name": "History",
    "color": "bg-red-500"
  },
  {
    "id": "science",
    "name": "Science",
    "color": "bg-blue-500"
  },
  {
    "id": "art",
    "name": "Art",
    "color": "bg-pink-500"
  },
  {
    "id": "technology",
    "name": "Technology",
    "color": "bg-gray-700"
  },
  {
    "id": "geography",
    "name": "Geography",
    "color": "bg-green-500"
  },
  {
    "id": "philosophy",
    "name": "Philosophy",
    "color": "bg-yellow-600"
  },
  {
    "id": "religion",
    "name": "Religion",
    "color": "bg-purple-600"
  },
  {
    "id": "society",
    "name": "Society",
    "color": "bg-orange-500"
  },
  {
    "id": "health",
    "name": "Health",
    "color": "bg-teal-500"
  },
  {
    "id": "mathematics",
    "name": "Mathematics",
    "color": "bg-indigo-500"
  },
  {
    "id": "nature",
    "name": "Nature",
    "color": "bg-lime-500"
  },
  {
    "id": "people",
    "name": "People",
    "color": "bg-amber-500"
  }
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
  "id": "iranian_history",
  "name": "Iranian History",
  "categoryId": "history",
  "description": "A comprehensive overview of significant periods in the history of Iran, from ancient civilizations to the modern Islamic Republic.",
  "events": [
    {
      "id": "elamite_civilization",
      "title": "Elamite Civilization",
      "description": "One of the earliest civilizations in Iran, centered in the far west and southwest of modern-day Iran.",
      "date": "-3200-01-01T00:00:00Z",
      "endDate": "-539-01-01T00:00:00Z",
      "mainImage": "placeholder_elamite.png",
      "category": "history"
    },
    {
      "id": "median_empire",
      "title": "Median Empire",
      "description": "The first Iranian empire, established by the Medes in the 7th century BC.",
      "date": "-678-01-01T00:00:00Z",
      "endDate": "-550-01-01T00:00:00Z",
      "mainImage": "placeholder_median.png",
      "category": "history"
    },
    {
      "id": "achaemenid_empire",
      "title": "Achaemenid Empire",
      "description": "Founded by Cyrus the Great, it became one of the largest empires in history.",
      "date": "-550-01-01T00:00:00Z",
      "endDate": "-330-01-01T00:00:00Z",
      "mainImage": "placeholder_achaemenid.png",
      "category": "history"
    },
    {
      "id": "parthian_empire",
      "title": "Parthian Empire",
      "description": "Also known as the Arsacid Empire, it was a major Iranian political and cultural power.",
      "date": "-247-01-01T00:00:00Z",
      "endDate": "224-01-01T00:00:00Z",
      "mainImage": "placeholder_parthian.png",
      "category": "history"
    },
    {
      "id": "sasanian_empire",
      "title": "Sasanian Empire",
      "description": "The last Iranian empire before the rise of Islam, ruling from 224 to 651 AD.",
      "date": "224-01-01T00:00:00Z",
      "endDate": "651-01-01T00:00:00Z",
      "mainImage": "placeholder_sasanian.png",
      "category": "history"
    },
    {
      "id": "islamic_conquest",
      "title": "Islamic Conquest of Persia",
      "description": "The Arab Muslim conquest that led to the fall of the Sasanian Empire and the spread of Islam in Iran.",
      "date": "633-01-01T00:00:00Z",
      "endDate": "651-01-01T00:00:00Z",
      "mainImage": "placeholder_islamic_conquest.png",
      "category": "history"
    },
    {
      "id": "safavid_dynasty",
      "title": "Safavid Dynasty",
      "description": "Established Twelver Shia Islam as the official religion of Iran.",
      "date": "1501-01-01T00:00:00Z",
      "endDate": "1736-01-01T00:00:00Z",
      "mainImage": "placeholder_safavid.png",
      "category": "history"
    },
    {
      "id": "qajar_dynasty",
      "title": "Qajar Dynasty",
      "description": "Ruled Iran from 1789 to 1925, a period marked by significant political and social changes.",
      "date": "1789-01-01T00:00:00Z",
      "endDate": "1925-01-01T00:00:00Z",
      "mainImage": "placeholder_qajar.png",
      "category": "history"
    },
    {
      "id": "pahlavi_dynasty",
      "title": "Pahlavi Dynasty",
      "description": "The last monarchy in Iran, overthrown during the 1979 Islamic Revolution.",
      "date": "1925-01-01T00:00:00Z",
      "endDate": "1979-01-01T00:00:00Z",
      "mainImage": "placeholder_pahlavi.png",
      "category": "history"
    },
    {
      "id": "islamic_republic",
      "title": "Islamic Republic of Iran",
      "description": "Established after the 1979 revolution, marking the beginning of the current political system.",
      "date": "1979-01-01T00:00:00Z",
      "endDate": "present",
      "mainImage": "placeholder_islamic_republic.png",
      "category": "history"
    }
  ]
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
