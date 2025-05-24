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
  "id": "ancient_egypt",
  "name": "Ancient Egypt",
  "categoryId": "history",
  "description": "A civilization of ancient North Africa, concentrated along the lower reaches of the Nile River, known for its rich history, monumental architecture, and contributions to human knowledge.",
  "events": [
    {
      "id": "predynastic_period",
      "title": "Predynastic Period",
      "description": "The era before the unification of Egypt, marked by the development of agriculture and early settlements along the Nile.",
      "date": "-6000-01-01T00:00:00Z",
      "endDate": "-3150-01-01T00:00:00Z",
      "mainImage": "placeholder_predynastic.png",
      "category": "history"
    },
    {
      "id": "early_dynastic_period",
      "title": "Early Dynastic Period",
      "description": "The period following the unification of Upper and Lower Egypt under the first pharaoh, Narmer, leading to the establishment of the First and Second Dynasties.",
      "date": "-3150-01-01T00:00:00Z",
      "endDate": "-2686-01-01T00:00:00Z",
      "mainImage": "placeholder_early_dynastic.png",
      "category": "history"
    },
    {
      "id": "old_kingdom",
      "title": "Old Kingdom",
      "description": "Known as the 'Age of the Pyramids,' this period saw the construction of the Great Pyramids of Giza and the rise of strong centralized government.",
      "date": "-2686-01-01T00:00:00Z",
      "endDate": "-2181-01-01T00:00:00Z",
      "mainImage": "placeholder_old_kingdom.png",
      "category": "history"
    },
    {
      "id": "first_intermediate_period",
      "title": "First Intermediate Period",
      "description": "A time of political fragmentation and climate instability, leading to the decline of centralized power and the rise of local rulers.",
      "date": "-2181-01-01T00:00:00Z",
      "endDate": "-2055-01-01T00:00:00Z",
      "mainImage": "placeholder_first_intermediate.png",
      "category": "history"
    },
    {
      "id": "middle_kingdom",
      "title": "Middle Kingdom",
      "description": "A period of reunification and cultural renaissance, marked by significant achievements in literature, art, and architecture.",
      "date": "-2055-01-01T00:00:00Z",
      "endDate": "-1650-01-01T00:00:00Z",
      "mainImage": "placeholder_middle_kingdom.png",
      "category": "history"
    },
    {
      "id": "second_intermediate_period",
      "title": "Second Intermediate Period",
      "description": "Characterized by the rule of the Hyksos in the north and internal divisions, leading to a decline in centralized authority.",
      "date": "-1650-01-01T00:00:00Z",
      "endDate": "-1550-01-01T00:00:00Z",
      "mainImage": "placeholder_second_intermediate.png",
      "category": "history"
    },
    {
      "id": "new_kingdom",
      "title": "New Kingdom",
      "description": "Egypt's most prosperous era, featuring powerful pharaohs like Hatshepsut, Akhenaten, Tutankhamun, and Ramesses II, and extensive territorial expansion.",
      "date": "-1550-01-01T00:00:00Z",
      "endDate": "-1069-01-01T00:00:00Z",
      "mainImage": "placeholder_new_kingdom.png",
      "category": "history"
    },
    {
      "id": "third_intermediate_period",
      "title": "Third Intermediate Period",
      "description": "A time of political instability and division, with multiple competing dynasties and foreign invasions.",
      "date": "-1069-01-01T00:00:00Z",
      "endDate": "-664-01-01T00:00:00Z",
      "mainImage": "placeholder_third_intermediate.png",
      "category": "history"
    },
    {
      "id": "late_period",
      "title": "Late Period",
      "description": "Marked by a series of foreign invasions and brief periods of native rule, culminating in Persian conquest.",
      "date": "-664-01-01T00:00:00Z",
      "endDate": "-332-01-01T00:00:00Z",
      "mainImage": "placeholder_late_period.png",
      "category": "history"
    },
    {
      "id": "ptolemaic_period",
      "title": "Ptolemaic Period",
      "description": "Established after Alexander the Great's conquest, this era saw Greek rulers, including Cleopatra VII, govern Egypt until the Roman annexation.",
      "date": "-332-01-01T00:00:00Z",
      "endDate": "-30-01-01T00:00:00Z",
      "mainImage": "placeholder_ptolemaic.png",
      "category": "history"
    },
    {
      "id": "roman_egypt",
      "title": "Roman Egypt",
      "description": "Following Cleopatra VII's defeat, Egypt became a province of the Roman Empire, marking the end of ancient Egyptian civilization.",
      "date": "-30-01-01T00:00:00Z",
      "endDate": "395-01-01T00:00:00Z",
      "mainImage": "placeholder_roman_egypt.png",
      "category": "history"
    }
  ]
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
