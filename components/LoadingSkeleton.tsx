import React from "react";

interface LoadingSkeletonProps {
  className?: string;
}

export const VideoCardSkeleton: React.FC<LoadingSkeletonProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`card bg-base-100 shadow-xl animate-pulse ${className}`}
    >
      <div className="aspect-video bg-base-300 rounded-t-2xl"></div>
      <div className="card-body p-4 space-y-3">
        <div className="h-6 bg-base-300 rounded w-3/4"></div>
        <div className="h-4 bg-base-300 rounded w-full"></div>
        <div className="h-4 bg-base-300 rounded w-2/3"></div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-16 bg-base-300 rounded"></div>
          <div className="h-16 bg-base-300 rounded"></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="h-5 bg-base-300 rounded w-24"></div>
          <div className="h-10 w-10 bg-base-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export const VideoGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <VideoCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default VideoCardSkeleton;
