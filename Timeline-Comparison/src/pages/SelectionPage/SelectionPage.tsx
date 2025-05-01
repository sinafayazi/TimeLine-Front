import { useState } from '@lynx-js/react';
import type { FC } from '@lynx-js/react';
import { CategorySelection } from '../../components/CategorySelection/CategorySelection.jsx';
import { SubjectSelection } from '../../components/SubjectSelection/SubjectSelection.jsx';

interface SelectionPageProps {
  onCompareSelected: (subject1: Subject, subject2: Subject) => void;
}

interface TimelineEvent {
  title: string;
  year: number;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Subject {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
  events: TimelineEvent[];
}

type ColorGroupKey = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'quinary';

const colorGroups = {
  primary: ['#FF6B6B', '#4ECDC4', '#9B59B6', '#2ECC71', '#F39C12'],
  secondary: ['#45B7D1', '#FF8787', '#8E44AD', '#52BE80', '#F4D03F'],
  tertiary: ['#5DADE2', '#FFA07A', '#9370DB', '#27AE60', '#E67E22'],
  quaternary: ['#7FB3D5', '#FF7F50', '#B39DDB', '#66BB6A', '#FFA726'],
  quinary: ['#68C768', '#FA8072', '#A569BD', '#68C768', '#FFB74D']
} as const;

let currentGroup: ColorGroupKey = 'primary';
let usedColors: string[] = [];

const getNextColorGroup = () => {
  const groups = Object.keys(colorGroups) as ColorGroupKey[];
  const currentIndex = groups.indexOf(currentGroup);
  const nextIndex = (currentIndex + 1) % groups.length;
  currentGroup = groups[nextIndex];
  return colorGroups[currentGroup];
};

const getRandomColor = (exclude?: string) => {
  // Get current color group
  const currentColors = colorGroups[currentGroup];

  // Filter out used colors and excluded color
  const availableColors = currentColors.filter(color => 
    !usedColors.includes(color) && color !== exclude
  );

  // If no colors available in current group, move to next group
  if (availableColors.length === 0) {
    const nextColors = getNextColorGroup();
    usedColors = [];
    return nextColors[Math.floor(Math.random() * nextColors.length)];
  }

  // Get random color from available colors
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const selectedColor = availableColors[randomIndex];
  usedColors.push(selectedColor);
  
  return selectedColor;
};

// Reset color selection when starting new comparison
const resetColorSelection = () => {
  currentGroup = 'primary';
  usedColors = [];
};

export const SelectionPage: FC<SelectionPageProps> = ({ onCompareSelected }) => {
  const [selectedCategory1, setSelectedCategory1] = useState<Category | null>(null);
  const [selectedCategory2, setSelectedCategory2] = useState<Category | null>(null);
  const [selectedSubject1, setSelectedSubject1] = useState<Subject | null>(null);
  const [step, setStep] = useState<'category1' | 'subject1' | 'category2' | 'subject2'>('category1');
  const [subject1Color, setSubject1Color] = useState<string>('');
  const [subject2Color, setSubject2Color] = useState<string>('');

  const handleBack = () => {
    if (step === 'subject1') {
      setSelectedCategory1(null);
      setSubject1Color('');
      resetColorSelection(); // Reset colors when going back to first step
      setStep('category1');
    } else if (step === 'category2') {
      setSelectedSubject1(null);
      setSubject1Color('');
      resetColorSelection(); // Reset colors when canceling first selection
      setStep('category1');
    } else if (step === 'subject2') {
      setSelectedCategory2(null);
      setSubject2Color('');
      setStep('category2');
    }
  };

  const handleCategorySelect = (category: Category) => {
    if (step === 'category1') {
      resetColorSelection(); // Reset colors when starting new selection
      const color = getRandomColor();
      setSelectedCategory1({ ...category, color });
      setSubject1Color(color);
      setStep('subject1');
    } else if (step === 'category2') {
      const color = getRandomColor(subject1Color);
      setSelectedCategory2({ ...category, color });
      setSubject2Color(color);
      setStep('subject2');
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    if (step === 'subject1') {
      setSelectedSubject1({ ...subject });
      setSelectedCategory1(null);
      setStep('category2');
    } else if (step === 'subject2' && selectedSubject1) {
      onCompareSelected(
        { ...selectedSubject1, color: subject1Color },
        { ...subject, color: subject2Color }
      );
    }
  };

  const categories = [
    { id: 'history', name: 'History', color: colorGroups.primary[0] },
    { id: 'religion', name: 'Religion', color: colorGroups.secondary[0] },
    { id: 'science', name: 'Science', color: colorGroups.tertiary[0] },
    { id: 'art', name: 'Art & Culture', color: colorGroups.quaternary[0] },
  ];

  const subjects = [
    {
      id: 'iran-history',
      name: 'Iranian History',
      categoryId: 'history',
      events: [
        { title: "Achaemenid Empire", year: -550 },
        { title: "Parthian Empire", year: -247 },
        { title: "Sasanian Empire", year: 224 },
        { title: "Safavid Dynasty", year: 1501 },
        { title: "Qajar Dynasty", year: 1789 },
      ]
    },
    {
      id: 'roman-history',
      name: 'Roman History',
      categoryId: 'history',
      events: [
        { title: "Roman Republic Founded", year: -509 },
        { title: "Julius Caesar", year: -49 },
        { title: "Roman Empire", year: 27 },
        { title: "Fall of Western Rome", year: 476 },
      ]
    },
    {
      id: 'islamic-history',
      name: 'Islamic History',
      categoryId: 'religion',
      events: [
        { title: "Birth of Islam", year: 570 },
        { title: "Islamic Golden Age", year: 750 },
        { title: "Ottoman Empire", year: 1299 },
        { title: "Fall of Ottoman Empire", year: 1922 },
      ]
    },
    {
      id: 'buddhism',
      name: 'Buddhism',
      categoryId: 'religion',
      events: [
        { title: "Birth of Buddha", year: -563 },
        { title: "First Buddhist Council", year: -483 },
        { title: "Buddhism Reaches China", year: -68 },
        { title: "Buddhism in Japan", year: 552 },
      ]
    },
    {
      id: 'scientific-revolution',
      name: 'Scientific Revolution',
      categoryId: 'science',
      events: [
        { title: "Copernican Revolution", year: 1543 },
        { title: "Galileo's Discoveries", year: 1610 },
        { title: "Newton's Principia", year: 1687 },
        { title: "Age of Enlightenment", year: 1715 },
      ]
    },
    {
      id: 'modern-physics',
      name: 'Modern Physics',
      categoryId: 'science',
      events: [
        { title: "Special Relativity", year: 1905 },
        { title: "General Relativity", year: 1915 },
        { title: "Quantum Mechanics", year: 1925 },
        { title: "Standard Model", year: 1970 },
      ]
    },
    {
      id: 'renaissance-art',
      name: 'Renaissance Art',
      categoryId: 'art',
      events: [
        { title: "Early Renaissance", year: 1300 },
        { title: "High Renaissance", year: 1490 },
        { title: "Late Renaissance", year: 1530 },
        { title: "Mannerism", year: 1590 },
      ]
    },
    {
      id: 'modern-art',
      name: 'Modern Art',
      categoryId: 'art',
      events: [
        { title: "Impressionism", year: 1870 },
        { title: "Post-Impressionism", year: 1886 },
        { title: "Cubism", year: 1907 },
        { title: "Abstract Expressionism", year: 1940 },
      ]
    },
  ];

  return (
    <view style={{
      width: "100%",
      height: "100vh",
      backgroundColor: "#FFFFFF",
      display: "flex",
      flexDirection: "column"
    }}>
      <view style={{ padding: "16px", marginTop: "40px" }}>
        {step !== 'category1' && (
          <view
            bindtap={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
              cursor: "pointer",
              backgroundColor: "#F5F5F5",
              padding: "8px 16px",
              borderRadius: "8px",
              width: "fit-content"
            }}
          >
            <text style={{ fontSize: "16px", marginRight: "8px" }}>←</text>
            <text style={{ fontSize: "16px", color: "#666666" }}>Back</text>
          </view>
        )}
        
        <text style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "24px",
          color: "black"
        }}>Timeline Comparison</text>
        
        <text style={{
          fontSize: "20px",
          color: "#666666",
          marginBottom: "16px"
        }}>
          {step === 'category1' && "Select first category"}
          {step === 'subject1' && "Select first subject"}
          {step === 'category2' && "Select second category"}
          {step === 'subject2' && "Select second subject"}
        </text>

        {(step === 'category1' || step === 'category2') ? (
          <CategorySelection
            categories={categories}
            onSelectCategory={handleCategorySelect}
          />
        ) : (
          <SubjectSelection
            subjects={subjects}
            selectedCategoryId={step === 'subject1' ? selectedCategory1?.id || '' : selectedCategory2?.id || ''}
            onSelectSubject={handleSubjectSelect}
            categoryColor={step === 'subject1' ? selectedCategory1?.color || '' : selectedCategory2?.color || ''}
          />
        )}
      </view>
    </view>
  );
};