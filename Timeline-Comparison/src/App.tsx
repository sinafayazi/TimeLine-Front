import { useCallback, useEffect, useState, useRef } from '@lynx-js/react'
import type { ScrollEvent } from '@lynx-js/types'

import './App.css'
import { VerticalScrollItem } from "./component/scrollItem.jsx";
import { HorizontalScrollItem } from "./component/scrollItem.jsx";

import arrow from './assets/arrow.png'
import lynxLogo from './assets/lynx-logo.png'
import reactLynxLogo from './assets/react-logo.png'

interface TimelineEvent {
  title: string;
  year: number;
}

const iranEvents: TimelineEvent[] = [
  { title: "Achaemenid Empire", year: 550 },
  { title: "Parthian Empire", year: 247 },
  { title: "Sasanian Empire", year: 224 },
  { title: "Samanid Empire", year: 819 },
  { title: "Safavid Empire", year: 1501 },
  { title: "Afsharid Dynasty", year: 1736 },
  { title: "Zand Dynasty", year: 1751 },
  { title: "Qajar Dynasty", year: 1789 },
  { title: "Pahlavi Dynasty", year: 1925 }
].sort((a, b) => a.year - b.year);

const islamicEvents: TimelineEvent[] = [
  { title: "Rise of Islam", year: 610 },
  { title: "Rashidun Caliphate", year: 632 },
  { title: "Umayyad Caliphate", year: 661 },
  { title: "Abbasid Caliphate", year: 750 },
  { title: "Fatimid Caliphate", year: 909 },
  { title: "Saladin Era", year: 1174 },
  { title: "Mamluk Sultanate", year: 1250 },
  { title: "Ottoman Empire", year: 1299 },
  { title: "Mughal Empire", year: 1526 }
].sort((a, b) => a.year - b.year);

const TimelineItem = ({ title, year, color, scale = 1, transformOrigin = 'center' }: { 
  title: string; 
  year: number; 
  color: string;
  scale?: number;
  transformOrigin?: string;
}) => (
  <view style={{
    backgroundColor: color,
    padding: "16px",
    borderRadius: "12px",
    width: "180px",
    transform: `scale(${scale})`,
    transformOrigin,
    transition: "all 0.3s ease",
    opacity: Math.max(0.4, scale)
  }}>
    <text style={{ 
      color: 'white', 
      fontSize: "24px", 
      fontWeight: "bold",
      marginBottom: "4px"
    }}>{title}</text>
    <text style={{ 
      color: 'white', 
      fontSize: "20px"
    }}>{year}</text>
  </view>
);

export const App = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemHeight = 120; // Height of each timeline item
  const visibleItems = 5; // Number of visible items
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - 240 : 600; // Viewport height minus header and footer

  // Combine and sort all events chronologically
  const allEvents = [...iranEvents, ...islamicEvents].sort((a, b) => a.year - b.year);
  
  // Find the index of each event in the sorted timeline
  const getEventIndex = (year: number) => {
    return allEvents.findIndex(event => event.year === year);
  };

  const getScale = (index: number, scrollTop: number) => {
    // Calculate the center position of the viewport
    const viewportCenter = scrollTop + (viewportHeight / 2);
    // Calculate the center position of the item
    const itemCenter = (index * itemHeight) + (itemHeight / 2);
    // Calculate the distance from the viewport center
    const distanceFromCenter = Math.abs(viewportCenter - itemCenter);
    // Convert distance to a 0-1 scale factor
    const scaleFactor = Math.max(0, 1 - (distanceFromCenter / (viewportHeight / 2)));
    // Apply non-linear scaling
    return 0.6 + (0.4 * Math.pow(scaleFactor, 2));
  };

  const getOpacity = (index: number, scrollTop: number) => {
    const viewportCenter = scrollTop + (viewportHeight / 2);
    const itemCenter = (index * itemHeight) + (itemHeight / 2);
    const distanceFromCenter = Math.abs(viewportCenter - itemCenter);
    const opacityFactor = Math.max(0, 1 - (distanceFromCenter / (viewportHeight / 2)));
    return 0.4 + (0.6 * opacityFactor);
  };

  const [scrollPosition, setScrollPosition] = useState(0);

  return (
    <view style={{ 
      width: "100%", 
      height: "100vh", 
      backgroundColor: "#FFFFFF", 
      display: "flex", 
      flexDirection: "column"
    }}>
      {/* Header */}
      <view style={{ padding: "16px", marginTop: "40px"}}>
        <text style={{ 
          fontSize: "32px", 
          fontWeight: "bold", 
          marginBottom: "24px", 
          color: "black"
        }}>Timeline Comparison</text>
      </view>

      {/* Category Buttons */}
      <view style={{ 
        padding: "0px 16px",
        display: "flex",
        flexDirection: "row",
        gap: "12px",
        marginBottom: "24px"
      }}>
        <view style={{ 
          backgroundColor: "#5FBFB0", 
          padding: "16px",
          borderRadius: "32px",
          flex: "1"
        }}>
          <text style={{ 
            color: "white", 
            fontWeight: "bold", 
            fontSize: "20px",
            textAlign: "center"
          }}>Iran History</text>
        </view>
        
        <view style={{ 
          backgroundColor: "#6B77C1",
          padding: "16px",
          borderRadius: "32px",
          flex: "1"
        }}>
          <text style={{ 
            color: "white", 
            fontWeight: "bold", 
            fontSize: "20px",
            textAlign: "center"
          }}>Islamic History</text>
        </view>
      </view>

      {/* Timeline Container */}
      <view style={{ 
        flex: 1,
        position: "relative",
        overflow: "hidden",
        height: "calc(100vh - 240px)" // Subtract header and bottom nav height
      }}>
        {/* Center Line */}
        <view style={{ 
          width: "2px", 
          backgroundColor: "#E0E0E0",
          position: "absolute",
          left: "50%",
          top: "0px",
          bottom: "0px",
          transform: "translateX(-50%)",
          zIndex: 1
        }} />

        {/* Scrollable Timeline */}
        <scroll-view
          scroll-y
          style={{ 
            height: "100%",
            overscrollBehavior: "contain"
          }}
          bindscroll={(event: ScrollEvent) => {
            const scrollTop = event.detail?.scrollTop || 0;
            setScrollPosition(scrollTop);
            // Calculate the index based on the center of the viewport
            const viewportCenter = scrollTop + (viewportHeight / 2);
            const index = Math.floor(viewportCenter / itemHeight);
            setSelectedIndex(index);
          }}
        >
          <view style={{ 
            padding: "0px 16px",
            paddingTop: `${itemHeight * 2}px`,
            paddingBottom: `${itemHeight * 2}px`,
            minHeight: `${itemHeight * (allEvents.length + 4)}px`
          }}>
            {iranEvents.map((event) => {
              const index = getEventIndex(event.year);
              return (
                <view key={`iran-${event.year}`} style={{ 
                  position: "absolute",
                  left: "0px",
                  right: "50%",
                  top: `${index * itemHeight}px`,
                  height: `${itemHeight}px`,
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingRight: "20px",
                  transition: "all 0.3s ease"
                }}>
                  <TimelineItem 
                    title={event.title} 
                    year={event.year} 
                    color="#5FBFB0"
                    scale={getScale(index, scrollPosition)}
                    transformOrigin="right center"
                  />
                </view>
              );
            })}

            {islamicEvents.map((event) => {
              const index = getEventIndex(event.year);
              return (
                <view key={`islamic-${event.year}`} style={{ 
                  position: "absolute",
                  left: "50%",
                  right: "0px",
                  top: `${index * itemHeight}px`,
                  height: `${itemHeight}px`,
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  paddingLeft: "20px",
                  transition: "all 0.3s ease"
                }}>
                  <TimelineItem 
                    title={event.title} 
                    year={event.year} 
                    color="#6B77C1"
                    scale={getScale(index, scrollPosition)}
                    transformOrigin="left center"
                  />
                </view>
              );
            })}

            {/* Year Markers */}
            {allEvents.map((event, index) => (
              <text key={`year-${event.year}`} style={{
                position: "absolute",
                left: "50%",
                top: `${index * itemHeight + itemHeight/2}px`,
                transform: "translateX(-50%)",
                color: "#666666",
                fontSize: "14px",
                opacity: getOpacity(index, scrollPosition)
              }}>{event.year}</text>
            ))}
          </view>
        </scroll-view>
      </view>

      {/* Bottom Navigation */}
      <view style={{ 
        padding: "16px",
        borderTopWidth: "1px",
        borderTopColor: "#E0E0E0",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: "80px"
      }}>
        <text style={{ color: "#666666", fontSize: "20px" }}>🏠</text>
        <text style={{ color: "#666666", fontSize: "20px" }}>⬇️</text>
        <text style={{ color: "#666666", fontSize: "20px" }}>🔍</text>
        <text style={{ color: "#666666", fontSize: "20px" }}>🔍</text>
        <text style={{ color: "#666666", fontSize: "20px" }}>☰</text>
      </view>
    </view>
  );
};
