import type { FC } from '@lynx-js/react';
import { useState } from '@lynx-js/react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategorySelectionProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const CategorySelection: FC<CategorySelectionProps> = ({ categories, onSelectCategory }) => {
  const [pressedId, setPressedId] = useState<string | null>(null);

  const getDarkerColor = (color: string) => {
    const darken = (hex: string) => {
      const num = parseInt(hex, 16);
      const darker = Math.max(0, num - 30);
      return darker.toString(16).padStart(2, '0');
    };
    
    const r = color.slice(1, 3);
    const g = color.slice(3, 5);
    const b = color.slice(5, 7);
    
    return `#${darken(r)}${darken(g)}${darken(b)}`;
  };

  return (
    <view style={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      {categories.map((category) => (
        <view
          key={category.id}
          bindtap={() => onSelectCategory(category)}
          style={{
            backgroundColor: pressedId === category.id ? getDarkerColor(category.color) : category.color,
            padding: "16px",
            borderRadius: "32px",
            cursor: "pointer",
            transition: "background-color 0.2s ease"
          }}
          bindtouchstart={() => setPressedId(category.id)}
          bindtouchend={() => setPressedId(null)}
          bindtouchcancel={() => setPressedId(null)}
        >
          <text style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
            textAlign: "center"
          }}>
            {category.name}
          </text>
        </view>
      ))}
    </view>
  );
};