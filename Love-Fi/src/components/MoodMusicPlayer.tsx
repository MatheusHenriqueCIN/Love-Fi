import React from 'react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
}

interface MoodMusicPlayerProps {
  videos: Video[];
}

const MoodMusicPlayer: React.FC<MoodMusicPlayerProps> = ({ videos }) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="music-results">
      <h2>Músicas para a sua Vibe:</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-item">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <h3>{video.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodMusicPlayer;