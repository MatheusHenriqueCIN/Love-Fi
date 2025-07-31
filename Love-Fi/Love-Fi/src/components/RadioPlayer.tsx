import React, { useState, useRef, useEffect } from 'react';

const RadioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(50); // Volume in percentage (0-100)
  const [liveStreams, setLiveStreams] = useState<string[]>([]);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null); // To hold the YouTube player object

  // This useEffect fetches the live streams from your backend
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const backendPort = '3001'; // Assuming default backend port
        const backendUrl = `http://localhost:${backendPort}/api/get-live-streams`;
        const response = await fetch(backendUrl);

        if (!response.ok) {
          throw new Error('Failed to fetch live streams.');
        }

        const data = await response.json();
        setLiveStreams(data.streamIds);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching live streams:', error);
        setIsLoading(false);
      }
    };

    fetchLiveStreams();
  }, []);

  // This useEffect initializes the YouTube IFrame Player API
  useEffect(() => {
    if (!isLoading && liveStreams.length > 0) {
      // Load the YouTube IFrame Player API script
      const script = document.createElement('script');
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);

      // Global function called by the API
      (window as any).onYouTubeIframeAPIReady = () => {
        playerRef.current = new (window as any).YT.Player('radio-iframe', {
          videoId: liveStreams[currentStreamIndex],
          playerVars: {
            'autoplay': 1,
            'controls': 0,
            'loop': 1,
            'enablejsapi': 1,
            'modestbranding': 1,
            'playlist': liveStreams.join(',') // Play all videos in loop
          },
          events: {
            'onReady': (event: any) => {
              event.target.setVolume(volume);
            }
          }
        });
      };
    }
  }, [isLoading, liveStreams]); // Run after streams are fetched

  // This useEffect updates the player when state changes
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
      playerRef.current.setVolume(volume);
    }
  }, [isPlaying, volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const handleNextStream = () => {
    const nextIndex = (currentStreamIndex + 1) % liveStreams.length;
    setCurrentStreamIndex(nextIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(liveStreams[nextIndex]);
    }
  };

  const handlePrevStream = () => {
    const prevIndex = (currentStreamIndex - 1 + liveStreams.length) % liveStreams.length;
    setCurrentStreamIndex(prevIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(liveStreams[prevIndex]);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-gray-800 p-3 rounded-lg shadow-xl" style={{ width: '250px' }}>
          <h3 className="text-sm font-bold text-cyan-400 mb-2 text-center">Carregando Rádio...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-gray-800 p-3 rounded-lg shadow-xl" style={{ width: '250px' }}>
        <h3 className="text-sm font-bold text-cyan-400 mb-2 text-center">Lo-Fi Radio</h3>
        <div className="flex items-center justify-between gap-2 mb-2">
          <button onClick={handlePrevStream} className="text-white text-base">
            &lt;&lt;
          </button>
          <button onClick={handlePlayPause} className="text-white text-2xl">
            {isPlaying ? '⏸' : '▶️'}
          </button>
          <button onClick={handleNextStream} className="text-white text-base">
            &gt;&gt;
          </button>
        </div>
        <input 
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full"
        />
        <div className="flex justify-center mt-2">
          {/* O iframe do player do YouTube. Ele será controlado pela API. */}
          <div id="radio-iframe" style={{ width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}></div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayer;
