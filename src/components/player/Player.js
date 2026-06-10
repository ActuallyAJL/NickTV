import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Player.css";
import { UseVideoPlayer } from "./UseVideoPlayer";
import { getMovieById } from "../modules/MovieManager";
import { url, key } from "../Settings";

export const Player = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState({});
  const [videoURL, setVideoURL] = useState("");

  useEffect(() => {
    getMovieById(movieId).then((thisMovie) => {
      setMovie(thisMovie.children[0]);
      setVideoURL(thisMovie.children[0].children[0].children[0].attributes.key);
    });
  }, []);

  const videoElement = useRef(null);
  const {
    playerState,
    togglePlay,
    handleOnTimeUpdate,
    handleVideoProgress,
    toggleMute,
    handleChangeVolume,
    openFullScreen,
  } = UseVideoPlayer(videoElement);

  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="video-wrapper">
        <video
          src={`${url}${videoURL}?X-Plex-Token=${key}`}
          ref={videoElement}
          onTimeUpdate={handleOnTimeUpdate}
        />
        <div className="player_header actions">
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            <i className="bx bx-back">
              <img className="bx-icon back-icon" src="/images/backicon.png" />
            </i>
          </button>
          <h1>{`${movie.attributes?.title} (${movie.attributes?.year})`}</h1>
        </div>
        <div className="progress_controls">
          <div className="actions">
            <button onClick={togglePlay}>
              {!playerState.isPlaying ? (
                <i className="bx bx-play">
                  <img
                    className="bx-icon play-icon"
                    src="/images/playicon.png"
                  />
                </i>
              ) : (
                <i className="bx bx-pause">
                  <img
                    className="bx-icon pause-icon"
                    src="/images/pauseicon.png"
                  />
                </i>
              )}
            </button>
          </div>
          <input
            id="player-progress-bar"
            type="range"
            min="0"
            max="100"
            step="1"
            value={playerState.progress}
            onChange={(e) => {
              handleVideoProgress(e);
            }}
          />
          <div className="actions">
            <button className="fs-btn" onClick={openFullScreen}>
              <i className="bx bxs-maximize-video">
                <img
                  className="bx-icon maximize-icon"
                  src="/images/maximizeicon.png"
                />
              </i>
            </button>
          </div>
        </div>
        <div className="volume_controls">
          <button className="mute-btn" onClick={toggleMute}>
            {!playerState.isMuted ? (
              <i className="bx bxs-volume-full">
                <img
                  className="bx-icon unmuted-icon"
                  src="/images/unmutedicon.png"
                />
              </i>
            ) : (
              <i className="bx bxs-volume-mute">
                <img
                  className="bx-icon muted-icon"
                  src="/images/mutedicon.png"
                />
              </i>
            )}
          </button>
          <input
            id="player-volume-bar"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={playerState.volume}
            onChange={(e) => {
              handleChangeVolume(e);
            }}
          />
        </div>
      </div>
    </div>
  );
};
