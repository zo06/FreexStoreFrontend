'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from './button';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface MediaSliderProps {
  imageUrl?: string;
  imageUrls?: string[] | string;
  youtubeUrl?: string;
  className?: string;
}

export function MediaSlider({ imageUrl, imageUrls, youtubeUrl, className = '' }: MediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Combine imageUrl and imageUrls into a single array
  // Handle imageUrls as comma-separated string from database
  const imageUrlsArray: string[] = Array.isArray(imageUrls) 
    ? imageUrls 
    : (typeof imageUrls === 'string' && imageUrls.trim() ? imageUrls.split(',').map((url: string) => url.trim()) : []);
  
  // Combine: imageUrl first (if exists), then imageUrls
  const allImages: string[] = [
    ...(imageUrl ? [imageUrl] : []),
    ...imageUrlsArray.filter(url => url !== imageUrl) // Avoid duplicates
  ];

  // Combine images and video into media items
  const mediaItems: MediaItem[] = [
    ...allImages.map((url: string) => ({ type: 'image' as const, url })),
    ...(youtubeUrl ? [{ 
      type: 'video' as const, 
      url: youtubeUrl,
      thumbnail: getYouTubeThumbnail(youtubeUrl)
    }] : [])
  ];

  // Reset index if media items change
  useEffect(() => {
    if (currentIndex >= mediaItems.length && mediaItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [mediaItems.length, currentIndex]);

  // Reset image loaded state when index changes
  useEffect(() => {
    setImageLoaded(true);
  }, [currentIndex]);

  // Extract YouTube video ID and create thumbnail URL
  function getYouTubeThumbnail(url: string): string {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  }

  // Extract YouTube video ID from various URL formats
  function extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  // Create YouTube embed URL
  function getYouTubeEmbedUrl(url: string): string {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
  }

  const changeSlide = useCallback((newIndex: number) => {
    if (isTransitioning || newIndex === currentIndex) return;
    setIsTransitioning(true);
    setIsVideoPlaying(false);
    
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  }, [currentIndex, isTransitioning]);

  const nextSlide = () => {
    changeSlide((currentIndex + 1) % mediaItems.length);
  };

  const prevSlide = () => {
    changeSlide((currentIndex - 1 + mediaItems.length) % mediaItems.length);
  };

  const goToSlide = (index: number) => {
    changeSlide(index);
  };

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  if (mediaItems.length === 0) {
    return (
      <div className={`flex justify-center items-center h-64 bg-gray-800 rounded-lg ${className}`}>
        <p className="text-gray-400">No media available</p>
      </div>
    );
  }

  const currentItem = mediaItems[currentIndex];

  return (
    <div className={`overflow-hidden relative bg-gray-900 rounded-xl shadow-2xl ${className}`}>
      {/* Main Media Display */}
      <div className="relative bg-black aspect-video">
        <div 
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        >
          {currentItem.type === 'image' ? (
            <img
              src={currentItem.url.startsWith('http') ? currentItem.url : `${process.env.NEXT_PUBLIC_BACKEND_URL}${currentItem.url}`}
              alt={`FiveM Script Preview Image ${currentIndex + 1} - High Quality Screenshot | FreexStore Premium Resource`}
              className={`object-cover w-full h-full transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="relative w-full h-full">
              {!isVideoPlaying ? (
                <>
                  <img
                    src={currentItem.thumbnail?.startsWith('http') ? currentItem.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${currentItem.thumbnail || ''}`}
                    alt="FiveM Script Video Preview Thumbnail - Watch Demo & Features | FreexStore"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="flex absolute inset-0 justify-center items-center bg-black/40 backdrop-blur-sm">
                    <Button
                      onClick={playVideo}
                      className="p-5 text-white bg-red-600 rounded-full shadow-xl transition-all duration-300 hover:bg-red-500 hover:scale-110 hover:shadow-red-500/30"
                    >
                      <Play className="ml-1 w-10 h-10" fill="currentColor" />
                    </Button>
                  </div>
                </>
              ) : (
                <iframe
                  src={getYouTubeEmbedUrl(currentItem.url)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="YouTube video"
                />
              )}
            </div>
          )}
        </div>

        {/* Loading spinner */}
        {!imageLoaded && currentItem.type === 'image' && (
          <div className="flex absolute inset-0 justify-center items-center bg-gray-900">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
          </div>
        )}

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <Button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-3 top-1/2 p-3 text-white rounded-full transition-all duration-300 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-white/20 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-3 top-1/2 p-3 text-white rounded-full transition-all duration-300 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-white/20 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Media Counter */}
        <div className="absolute right-4 bottom-4 px-4 py-2 text-sm font-medium text-white rounded-full shadow-lg bg-black/60 backdrop-blur-sm">
          {currentIndex + 1} / {mediaItems.length}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {mediaItems.length > 1 && (
        <div className="flex overflow-x-auto gap-3 p-4 bg-gradient-to-t from-gray-900 to-gray-800 scrollbar-hide">
          {mediaItems.map((item, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 transform ${
                index === currentIndex
                  ? 'border-blue-500 ring-2 ring-blue-500/50 scale-105 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600/50 hover:border-gray-400 hover:scale-105'
              } ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${item.url}`}
                  alt={`FiveM Script Gallery Thumbnail ${index + 1} - Preview Image | FreexStore`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={item.thumbnail?.startsWith('http') ? item.thumbnail : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${item.thumbnail || ''}`}
                    alt="FiveM Script Video Thumbnail - Click to Watch Demo | FreexStore"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="flex absolute inset-0 justify-center items-center bg-black/60">
                    <Play className="w-4 h-4 text-red-500" fill="currentColor" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

