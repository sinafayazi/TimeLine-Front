import type { FC } from '@lynx-js/react';
import { useState, useEffect } from '@lynx-js/react';
import { SafeImage } from '../../components/SafeImage';

interface EventDetailsPageProps {
  title: string;
  year: number;
  endYear?: number;
  description?: string;
  mainImage?: string;
  images?: string[];
  color: string;
  onBack: () => void;
}

export const EventDetailsPage: FC<EventDetailsPageProps> = ({
  title,
  year,
  endYear,
  description,
  mainImage,
  images = [],
  color,
  onBack
}) => {
  const [isBackHovered, setIsBackHovered] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pressedImageIndex, setPressedImageIndex] = useState<number | null>(null);
  const allImages = mainImage ? [mainImage, ...images] : images;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleScroll = (event: any) => {
    setScrollY(event.detail?.scrollTop || 0);
  };

  const headerOpacity = Math.max(0, Math.min(1, 1 - (scrollY / 100))); // Made fade faster
  const headerScale = Math.max(0.8, Math.min(1, 1 - (scrollY / 400))); // Made scale faster
  const headerHeight = Math.max(150, 400 - scrollY * 1.2); // Made header shrink faster and minimum height smaller

  return (
    <view style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#FFFFFF",
      zIndex: 1000,
      opacity: isVisible ? 1 : 0,
      transform: `translateY(${isVisible ? '0' : '20px'})`,
      transition: "opacity 0.3s ease, transform 0.3s ease"
    }}>
      {/* Hero Header */}
      <view style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: `${headerHeight}px`,
        backgroundColor: color,
        overflow: "hidden",
        transition: "height 0.3s ease"
      }}>
        {mainImage && (
          <view style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.2,
            overflow: "hidden"
          }}>
            <SafeImage 
              src={mainImage}
              fallbackSrc="/assets/fallbacks/default.png"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </view>
        )}
        
        {/* Gradient Overlay */}
        <view style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(to bottom, ${color}CC, ${color})`
        }} />

        {/* Content */}
        <view style={{
          position: "relative",
          height: "100%",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          {/* Back Button */}
          <view
            bindtap={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 20px",
              backgroundColor: isBackHovered ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s ease",
              cursor: "pointer",
              alignSelf: "flex-start",
              marginTop: "40px",
              transform: `scale(${headerScale})`,
              opacity: headerOpacity,
              width: "fit-content"
            }}
            bindtouchstart={() => setIsBackHovered(true)}
            bindtouchend={() => setIsBackHovered(false)}
            bindtouchcancel={() => setIsBackHovered(false)}
          >
            <text style={{
              fontSize: "20px",
              marginRight: "8px",
              color: "white"
            }}>←</text>
            <text style={{
              fontSize: "16px",
              color: "white",
              fontWeight: "600"
            }}>Back to Timeline</text>
          </view>

          {/* Title Section */}
          <view style={{
            transform: `scale(${headerScale}) translateY(${scrollY * 0.2}px)`,
            opacity: headerOpacity,
            transformOrigin: "left bottom"
          }}>
            <text style={{
              fontSize: "48px",
              fontWeight: "800",
              color: "white",
              marginBottom: "16px",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>{title}</text>

            <text style={{
              fontSize: "24px",
              color: "white",
              opacity: 0.9,
              fontWeight: "500"
            }}>
              {endYear
                ? `${year < 0 ? `${Math.abs(year)} BCE` : year} - ${endYear < 0 ? `${Math.abs(endYear)} BCE` : endYear}`
                : year < 0 ? `${Math.abs(year)} BCE` : year}
            </text>
          </view>
        </view>
      </view>

      {/* Content */}
      <scroll-view
        scroll-y
        bindscroll={handleScroll}
        style={{
          height: "100%",
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          marginTop: "300px",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          position: "relative",
          zIndex: 2
        }}
      >
        <view style={{
          padding: "32px 24px",
          paddingTop: "40px"
        }}>
          {description && (
            <view style={{
              backgroundColor: "#F8F9FA",
              padding: "24px",
              borderRadius: "16px",
              marginBottom: "40px"
            }}>
              <text style={{
                fontSize: "18px",
                lineHeight: "1.7",
                color: "#2C3E50",
                fontWeight: "400"
              }}>{description}</text>
            </view>
          )}

          {allImages.length > 0 && (
            <view style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px"
            }}>
              <text style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1A1A1A",
                marginBottom: "8px"
              }}>Gallery</text>

              <view style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px"
              }}>
                {allImages.map((image, index) => (
                  <view
                    key={`image-${index}`}
                    bindtap={() => setSelectedImageIndex(index)}
                    bindtouchstart={() => setPressedImageIndex(index)}
                    bindtouchend={() => setPressedImageIndex(null)}
                    bindtouchcancel={() => setPressedImageIndex(null)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: pressedImageIndex === index ? "scale(0.98)" : "scale(1)",
                      transition: "transform 0.2s ease"
                    }}
                  >
                    <SafeImage
                      src={image}
                      fallbackSrc="/assets/fallbacks/default.png"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </view>
                ))}
              </view>
            </view>
          )}
          
          {/* Bottom Spacing */}
          <view style={{ height: "40px" }} />
        </view>
      </scroll-view>

      {/* Fullscreen Image Viewer */}
      {selectedImageIndex !== null && (
        <view
          bindtap={() => setSelectedImageIndex(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.95)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            opacity: 1,
            animation: "fadeIn 0.2s ease"
          }}
        >
          <view
            bindtap={() => setSelectedImageIndex(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <text style={{
              color: "white",
              fontSize: "24px"
            }}>×</text>
          </view>
          
          <image
            src={allImages[selectedImageIndex]}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
            }}
          />
        </view>
      )}
    </view>
  );
};