import type { FC } from '@lynx-js/react';
import { useState } from '@lynx-js/react';

interface Subject {
  id: string;
  name: string;
  categoryId: string;
  color?: string;
  events: Array<{
    title: string;
    year: number;
  }>;
}

interface SubjectSelectionProps {
  subjects: Subject[];
  selectedCategoryId: string;
  onSelectSubject: (subject: Subject) => void;
  categoryColor: string;
}

export const SubjectSelection: FC<SubjectSelectionProps> = ({ 
  subjects, 
  selectedCategoryId, 
  onSelectSubject,
  categoryColor 
}) => {
  const [pressedId, setPressedId] = useState<string | null>(null);
  
  const filteredSubjects = subjects.filter(
    subject => subject.categoryId === selectedCategoryId
  );

  return (
    <view style={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      {filteredSubjects.map((subject) => (
        <view
          key={subject.id}
          bindtap={() => onSelectSubject({ ...subject, color: categoryColor })}
          style={{
            backgroundColor: pressedId === subject.id ? `${categoryColor}cc` : categoryColor,
            padding: "16px",
            borderRadius: "16px",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          bindtouchstart={() => setPressedId(subject.id)}
          bindtouchend={() => setPressedId(null)}
          bindtouchcancel={() => setPressedId(null)}
        >
          <text style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "4px"
          }}>
            {subject.name}
          </text>
          <text style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "14px"
          }}>
            {`${subject.events.length} events`}
          </text>
        </view>
      ))}
    </view>
  );
};