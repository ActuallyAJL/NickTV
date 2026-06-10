import React, { useState, useEffect } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";

export const UseVideoPlayer = (videoElement) => {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    progress: 0,
    volume: 1,
    isMuted: false,
  });

  const togglePlay = () => {
    setPlayerState({
      ...playerState,
      isPlaying: !playerState.isPlaying,
    });
  };

  const toggleMute = () => {
    setPlayerState({
      ...playerState,
      isMuted: !playerState.isMuted,
    });
  };

  const openFullScreen = () => {
    if (videoElement.current.requestFullscreen) {
      videoElement.current.requestFullscreen();
    } else if (videoElement.current.webkitRequestFullscreen) {
      videoElement.current.webkitRequestFullscreen();
    } else if (videoElement.current.msRequestFullscreen) {
      videoElement.current.msRequestFullscreen();
    }
  };

  useEffect(() => {
    playerState.isPlaying
      ? videoElement.current.play()
      : videoElement.current.pause();
  }, [playerState.isPlaying, videoElement]);

  useEffect(() => {
    playerState.isMuted
      ? (videoElement.current.muted = true)
      : (videoElement.current.muted = false);
  }, [playerState.isMuted, videoElement]);

  const handleOnTimeUpdate = () => {
    const progress =
      (videoElement.current.currentTime / videoElement.current.duration) * 100;
    setPlayerState({
      ...playerState,
      progress,
    });
  };

  const handleVideoProgress = (event) => {
    const manualChange = Number(event.target.value);
    videoElement.current.currentTime =
      (videoElement.current.duration / 100) * manualChange;
    setPlayerState({
      ...playerState,
      progress: manualChange,
    });
  };

  const handleChangeVolume = (event) => {
    const manualChange = Number(event.target.value);
    videoElement.current.volume = manualChange;
    setPlayerState({
      ...playerState,
      volume: manualChange,
    });
  };

  return {
    playerState,
    togglePlay,
    handleOnTimeUpdate,
    handleVideoProgress,
    toggleMute,
    handleChangeVolume,
    openFullScreen,
  };
};
