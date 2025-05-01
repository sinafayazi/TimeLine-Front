import type { FC } from '@lynx-js/react';
import { useState } from '@lynx-js/react';

interface TimelineItemProps {
  title: string;
  year: number;
  endYear?: number;
  color: string;
  mainImage?: string;
  images?: string[];
  scale?: number;
  opacity?: number;
  transformOrigin?: string;
  onSelect?: () => void;
}

export const TimelineItem: FC<TimelineItemProps> = ({ 
  title, 
  year,
  endYear,
  mainImage,
  color, 
  scale = 1,
  opacity = 1,
  transformOrigin = 'center',
  onSelect
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const backgroundColor = isPressed ? color.replace(/^#/, '#CC') : color;
  const isDuration = endYear != null;

  const handleInteractionStart = () => {
    setIsPressed(true);
  };

  const handleInteractionEnd = () => {
    setIsPressed(false);
    onSelect?.();
  };

  const handleInteractionCancel = () => {
    setIsPressed(false);
  };

  return (
    <view
      style={{
        backgroundColor,
        padding: isDuration ? "12px 16px" : "16px",
        borderRadius: "12px",
        width: "180px",
        transform: `scale(${scale})`,
        opacity: opacity,
        transformOrigin,
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        position: "relative",
        overflow: "hidden"
      }}
      bindtouchstart={handleInteractionStart}
      bindtouchend={handleInteractionEnd}
      bindtouchcancel={handleInteractionCancel}
      bindtap={handleInteractionEnd}
    >
      {mainImage && (
        <view style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          backgroundImage: `url(${mainImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginBottom: "8px"
        }} />
      )}
      
      <view style={{
        marginTop: mainImage ? "60px" : 0
      }}>
        <text style={{ 
          color: 'white', 
          fontSize: isDuration ? "20px" : "24px", 
          fontWeight: "bold",
          marginBottom: "4px"
        }}>{title}</text>
        
        <text style={{ 
          color: 'white', 
          fontSize: isDuration ? "16px" : "20px"
        }}>
          {isDuration ? (
            `${year < 0 ? `${Math.abs(year)} BCE` : year} - ${endYear < 0 ? `${Math.abs(endYear)} BCE` : endYear}`
          ) : (
            year < 0 ? `${Math.abs(year)} BCE` : year
          )}
        </text>
      </view>
    </view>
  );
};