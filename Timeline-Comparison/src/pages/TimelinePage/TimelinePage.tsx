import { useState } from '@lynx-js/react';
import type { FC } from '@lynx-js/react';
import type { ScrollEvent } from '@lynx-js/types';
import { TimelineItem } from '../../components/TimelineItem/TimelineItem.jsx';
import { EventDetailsPage } from '../EventDetailsPage/EventDetailsPage.jsx';

interface TimelineEvent {
  title: string;
  year: number;
  endYear?: number;
  description?: string;
  mainImage?: string;
  images?: string[];
}

interface TimelinePageProps {
  subject1: {
    name: string;
    color: string;
    events: TimelineEvent[];
  };
  subject2: {
    name: string;
    color: string;
    events: TimelineEvent[];
  };
  onBack: () => void;
}

export const TimelinePage: FC<TimelinePageProps> = ({ subject1, subject2, onBack }) => {
  const itemHeight = 120;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - 240 : 600;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<(TimelineEvent & { color: string }) | null>(null);

  // Sort all events by their start year
  const allEvents = [...subject1.events, ...subject2.events].sort((a, b) => {
    // Sort by start year first
    if (a.year !== b.year) return a.year - b.year;
    // If start years are same, sort by end year (events with duration come after single events)
    if (a.endYear && b.endYear) return a.endYear - b.endYear;
    if (a.endYear) return 1;
    if (b.endYear) return -1;
    return 0;
  });

  const getEventIndex = (event: TimelineEvent) => {
    return allEvents.findIndex(e => 
      e.year === event.year && 
      e.title === event.title && 
      e.endYear === event.endYear
    );
  };

  const getScale = (index: number, scrollTop: number) => {
    const viewportMiddle = scrollTop + (viewportHeight / 2);
    const itemMiddle = (index * itemHeight) + (itemHeight / 2);
    const distance = Math.abs(viewportMiddle - itemMiddle);
    const maxDistance = viewportHeight / 2;
    
    const scale = Math.max(0.5, 1 - (distance / maxDistance) * 0.5);
    return {
      scale,
      opacity: Math.max(0.5, scale)
    };
  };

  return (
    <view style={{
      width: "100%",
      height: "100vh",
      backgroundColor: "#FFFFFF",
      display: "flex",
      flexDirection: "column"
    }}>
      {selectedEvent ? (
        <EventDetailsPage 
          {...selectedEvent}
          onBack={() => setSelectedEvent(null)}
        />
      ) : (
        <>
          <view style={{ 
            padding: "16px", 
            marginTop: "40px",
            borderBottom: "1px solid #E0E0E0"
          }}>
            <view style={{ 
              display: "flex", 
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px"
            }}>
              <view 
                bindtap={onBack}
                style={{ 
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  backgroundColor: isBackHovered ? "#F5F5F5" : "#FFFFFF",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "background-color 0.2s ease",
                  cursor: "pointer"
                }}
                bindtouchstart={() => setIsBackHovered(true)}
                bindtouchend={() => setIsBackHovered(false)}
                bindtouchcancel={() => setIsBackHovered(false)}
              >
                <text style={{ 
                  fontSize: "16px", 
                  marginRight: "8px",
                  color: "#333333"
                }}>←</text>
                <text style={{ 
                  fontSize: "16px",
                  color: "#333333",
                  fontWeight: "500"
                }}>Back to Selection</text>
              </view>
            </view>

            <text style={{
              fontSize: "32px",
              fontWeight: "bold",
              marginBottom: "24px",
              color: "black"
            }}>Timeline Comparison</text>

            <view style={{
              display: "flex",
              flexDirection: "row",
              gap: "12px",
              marginBottom: "24px"
            }}>
              <view style={{
                backgroundColor: subject1.color,
                padding: "16px",
                borderRadius: "32px",
                flex: "1"
              }}>
                <text style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "20px",
                  textAlign: "center"
                }}>{subject1.name}</text>
              </view>

              <view style={{
                backgroundColor: subject2.color,
                padding: "16px",
                borderRadius: "32px",
                flex: "1"
              }}>
                <text style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "20px",
                  textAlign: "center"
                }}>{subject2.name}</text>
              </view>
            </view>
          </view>

          <view style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            height: "calc(100vh - 240px)"
          }}>
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

            <scroll-view
              scroll-y
              style={{
                height: "100%",
                overscrollBehavior: "contain"
              }}
              bindscroll={(event: ScrollEvent) => {
                setScrollPosition(event.detail?.scrollTop || 0);
              }}
            >
              <view style={{
                padding: "0px 16px",
                paddingTop: `${itemHeight * 2}px`,
                paddingBottom: `${itemHeight * 2}px`,
                minHeight: `${itemHeight * (allEvents.length + 4)}px`,
                position: "relative"
              }}>
                {subject1.events.map((event) => {
                  const index = getEventIndex(event);
                  const { scale, opacity } = getScale(index, scrollPosition);
                  return (
                    <view key={`subject1-${event.year}-${event.title}`} style={{
                      position: "absolute",
                      left: "0px",
                      right: "50%",
                      top: `${index * itemHeight}px`,
                      height: event.endYear ? `${itemHeight * 2}px` : `${itemHeight}px`,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      paddingRight: "20px"
                    }}>
                      <TimelineItem
                        {...event}
                        color={subject1.color}
                        scale={scale}
                        opacity={opacity}
                        transformOrigin="right center"
                        onSelect={() => setSelectedEvent({ ...event, color: subject1.color })}
                      />
                    </view>
                  );
                })}

                {subject2.events.map((event) => {
                  const index = getEventIndex(event);
                  const { scale, opacity } = getScale(index, scrollPosition);
                  return (
                    <view key={`subject2-${event.year}-${event.title}`} style={{
                      position: "absolute",
                      left: "50%",
                      right: "0px",
                      top: `${index * itemHeight}px`,
                      height: event.endYear ? `${itemHeight * 2}px` : `${itemHeight}px`,
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      paddingLeft: "20px"
                    }}>
                      <TimelineItem
                        {...event}
                        color={subject2.color}
                        scale={scale}
                        opacity={opacity}
                        transformOrigin="left center"
                        onSelect={() => setSelectedEvent({ ...event, color: subject2.color })}
                      />
                    </view>
                  );
                })}

                {/* Timeline markers */}
                {allEvents.map((event, index) => (
                  <view key={`marker-${event.year}-${event.title}`}>
                    <text style={{
                      position: "absolute",
                      left: "50%",
                      top: `${index * itemHeight + itemHeight/2}px`,
                      transform: "translateX(-50%)",
                      color: "#666666",
                      fontSize: "14px",
                      fontWeight: "500",
                      opacity: getScale(index, scrollPosition).opacity
                    }}>
                      {event.year < 0 ? `${Math.abs(event.year)} BCE` : event.year}
                    </text>
                    {event.endYear && (
                      <view style={{
                        position: "absolute",
                        left: "50%",
                        top: `${index * itemHeight + itemHeight/2}px`,
                        width: "2px",
                        height: `${itemHeight}px`,
                        backgroundColor: "#E0E0E0",
                        opacity: getScale(index, scrollPosition).opacity
                      }} />
                    )}
                  </view>
                ))}
              </view>
            </scroll-view>
          </view>
        </>
      )}
    </view>
  );
};