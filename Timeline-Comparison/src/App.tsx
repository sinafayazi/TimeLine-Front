import { useState } from '@lynx-js/react';
import './App.css';
import { SelectionPage } from './pages/SelectionPage/SelectionPage.jsx';
import { TimelinePage } from './pages/TimelinePage/TimelinePage.jsx';

interface TimelineEvent {
  title: string;
  year: number;
  endYear?: number;
  description?: string;
  mainImage?: string;
  images?: string[];
}

interface Subject {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
  events: TimelineEvent[];
}

// Mock data
const mockTechnologyEvents: TimelineEvent[] = [
  {
    title: "First Mobile Phone",
    year: 1973,
    description: "Martin Cooper made the first handheld cellular phone call on a Motorola DynaTAC. This revolutionary moment marked the beginning of the mobile phone era. The DynaTAC 8000X became the first commercially available cell phone in 1983, weighing 2.5 pounds and offering 30 minutes of talk time.",
    mainImage: "https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1000",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
      "https://images.unsplash.com/photo-1557189750-56d1be9e963a?q=80&w=1000",
      "https://images.unsplash.com/photo-1570101945621-945409a6370f?q=80&w=1000"
    ]
  },
  {
    title: "Smartphone Revolution",
    year: 2007,
    endYear: 2010,
    description: "The introduction of the iPhone in 2007 revolutionized mobile computing, followed by Android phones that together transformed how we interact with technology. This era marked a fundamental shift in personal computing, bringing powerful computers into our pockets. The App Store launched in 2008 created a new digital economy and changed how we access services and entertainment.",
    mainImage: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=1000",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1000",
      "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=1000",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1000",
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1000"
    ]
  }
];

const mockArtEvents: TimelineEvent[] = [
  {
    title: "Impressionism Movement",
    year: 1872,
    endYear: 1892,
    description: "A 19th-century art movement characterized by small, thin brush strokes, emphasis on light, and ordinary subject matter.",
    mainImage: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1569227997100-2834398c8dea?q=80&w=1000"
    ]
  },
  {
    title: "Pop Art Era",
    year: 1955,
    endYear: 1975,
    description: "An art movement that emerged in the 1950s, challenging traditions by including imagery from popular culture.",
    mainImage: "https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000"
    ]
  }
];

const mockBuddhismEvents: TimelineEvent[] = [
  {
    title: "Birth of Buddha",
    year: -563,
    description: "Siddhartha Gautama, who later became the Buddha, was born in Lumbini, present-day Nepal.",
    mainImage: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1610308035593-ac5c16c15ad5?q=80&w=1000"
    ]
  },
  {
    title: "Buddhism Spreads to China",
    year: -200,
    endYear: 200,
    description: "Buddhism began to spread from India to China via the Silk Road trade routes.",
    mainImage: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1000"
    ]
  }
];

const mockRomanEvents: TimelineEvent[] = [
  {
    title: "Founding of Rome",
    year: -753,
    description: "According to tradition, Rome was founded by Romulus on the Palatine Hill.",
    mainImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1588614959060-4d156fcd576e?q=80&w=1000"
    ]
  },
  {
    title: "Roman Republic",
    year: -509,
    endYear: -27,
    description: "Period of ancient Roman civilization beginning with the overthrow of the Roman Kingdom and ending with the establishment of the Roman Empire.",
    mainImage: "https://images.unsplash.com/photo-1626623757048-6400c65ea195?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000"
    ]
  }
];

const mockIslamicEvents: TimelineEvent[] = [
  {
    title: "Birth of Islam",
    year: 570,
    description: "Prophet Muhammad was born in Mecca, marking the beginning of Islamic history.",
    mainImage: "https://images.unsplash.com/photo-1564769610726-59cead6a6f8f?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1585129777188-95726028a6e7?q=80&w=1000"
    ]
  },
  {
    title: "Islamic Golden Age",
    year: 750,
    endYear: 1258,
    description: "A period of scientific, cultural, and economic flourishing in Islamic history, marked by advances in mathematics, astronomy, medicine, and architecture.",
    mainImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1542315204-5da5dd15ae4e?q=80&w=1000"
    ]
  }
];

const mockIranianEvents: TimelineEvent[] = [
  {
    title: "Cyrus the Great",
    year: -559,
    endYear: -530,
    description: "Founder of the Achaemenid Empire, the first Persian Empire. Known for his charter of human rights and religious tolerance.",
    mainImage: "https://images.unsplash.com/photo-1561828995-aa79a2db86dd?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1568742339336-55c0d854ae89?q=80&w=1000"
    ]
  },
  {
    title: "Safavid Dynasty",
    year: 1501,
    endYear: 1736,
    description: "One of Iran's most significant ruling dynasties, establishing Twelver Islam as the official religion and ushering in a golden age of Persian art and culture.",
    mainImage: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?q=80&w=1000"
    ]
  }
];

export const App = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<{
    subject1: Subject | null;
    subject2: Subject | null;
  }>({
    subject1: null,
    subject2: null
  });

  const handleCompareSelected = (subject1: Subject, subject2: Subject) => {
    // Add appropriate mock events based on category and subject
    const getEventsForSubject = (subject: Subject) => {
      switch (subject.id) {
        case 'iran-history':
          return mockIranianEvents;
        case 'islamic-history':
          return mockIslamicEvents;
        case 'buddhism':
          return mockBuddhismEvents;
        case 'roman-history':
          return mockRomanEvents;
        case 'renaissance-art':
        case 'modern-art':
          return mockArtEvents;
        case 'scientific-revolution':
        case 'modern-physics':
          return mockTechnologyEvents;
        default:
          return [];
      }
    };

    const enhancedSubject1 = {
      ...subject1,
      events: getEventsForSubject(subject1)
    };
    const enhancedSubject2 = {
      ...subject2,
      events: getEventsForSubject(subject2)
    };

    setSelectedSubjects({
      subject1: enhancedSubject1,
      subject2: enhancedSubject2
    });
  };

  const handleBack = () => {
    setSelectedSubjects({
      subject1: null,
      subject2: null
    });
  };

  if (selectedSubjects.subject1 && selectedSubjects.subject2) {
    return (
      <TimelinePage
        subject1={{
          name: selectedSubjects.subject1.name,
          color: selectedSubjects.subject1.color || '#5FBFB0',
          events: selectedSubjects.subject1.events
        }}
        subject2={{
          name: selectedSubjects.subject2.name,
          color: selectedSubjects.subject2.color || '#6B77C1',
          events: selectedSubjects.subject2.events
        }}
        onBack={handleBack}
      />
    );
  }

  return (
    <SelectionPage onCompareSelected={handleCompareSelected} />
  );
};
