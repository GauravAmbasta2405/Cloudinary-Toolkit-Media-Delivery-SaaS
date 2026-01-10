import React, { useState, useEffect, useCallback } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "@/types";

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const getThumbnailUrl = useCallback((publicId: string) => {
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 225,
      crop: "fill",
      gravity: "auto",
      format: "jpg",
      quality: "auto",
      assetType: "video",
    });
  }, []);
  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 1920,
      height: 1080,
    });
  }, []);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({
      src: publicId,
      width: 400,
      height: 225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"],
    });
  }, []);

  const formatSize = useCallback((size: number) => {
    return filesize(size);
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const compressionPercentage = Math.round(
    (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
  );

  useEffect(() => {
    setPreviewError(false);
  }, [isHovered]);

  const handlePreviewError = () => {
    setPreviewError(true);
  };
  return (
    <div
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure className="aspect-video relative overflow-hidden group">
        {isHovered ? (
          previewError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-red-500">Preview not available</p>
            </div>
          ) : (
            <video
              src={getPreviewVideoUrl(video.publicId)}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onError={handlePreviewError}
            />
          )
        ) : (
          <img
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs flex items-center">
          <Clock size={16} className="mr-1" />
          {formatDuration(video.duration)}
        </div>
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full">
            Hover to preview
          </span>
        </div>
      </figure>
      <div className="card-body p-4">
        <h2 className="text-base font-semibold truncate">{video.title}</h2>

        <p className="text-xs text-base-content opacity-60 line-clamp-2 mt-1">
          {video.description || "No description provided"}
        </p>

        <p className="text-sm text-base-content opacity-70 mb-4">
          Uploaded {dayjs(video.createdAt).fromNow()}
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs mt-2">
          <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2">
            <FileUp size={16} className="text-primary" />
            <div>
              <div className="font-medium opacity-70">Original</div>
              <div className="font-semibold">
                {formatSize(Number(video.originalSize))}
              </div>
            </div>
          </div>

          <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2">
            <FileDown size={16} className="text-secondary" />
            <div>
              <div className="font-medium opacity-70">Compressed</div>
              <div className="font-semibold">
                {formatSize(Number(video.compressedSize))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-3 border-t border-base-300">
          <div className="text-xs">
            <span className="opacity-60">Size reduced</span>
            <div className="text-base font-semibold text-accent">
              {compressionPercentage}% saved
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              onDownload(getFullVideoUrl(video.publicId), video.title)
            }
            style={{
              backgroundColor: "#570DF8",
              color: "white",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
            title="Download video"
          >
            <Download size={16} className="mr-1" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
