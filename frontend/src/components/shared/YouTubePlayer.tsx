"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title?: string;
  className?: string;
}

export function YouTubePlayer({ videoId, title = "YouTube video player", className = "" }: YouTubePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Use the standard YouTube embed URL format
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-gray-900 aspect-video shadow-md ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      <iframe
        className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      ></iframe>
    </div>
  );
}
