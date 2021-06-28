import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import "./player.css";
import PlayerList from "./player-list";
import { VideoListType } from "../types";

interface HTMLVideoElementExt extends HTMLVideoElement {
  msRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
}

interface Document {
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
}

type VideoProps = {
  videoList: VideoListType[];
};

const Player = ({ videoList }: VideoProps) => {
  let playerRef = useRef<HTMLVideoElement>(null!);
  let playBtn = useRef<HTMLDivElement>(null!);
  let volumeBtn = useRef<HTMLDivElement>(null!);
  let volumeSlider = useRef<HTMLDivElement>(null!);
  let volumeFill = useRef<HTMLDivElement>(null!);
  let progressSlider = useRef<HTMLDivElement>(null!);
  let progressFill = useRef<HTMLDivElement>(null!);
  let currentTimeDiv = useRef<HTMLDivElement>(null!);
  let textTotal = useRef<HTMLDivElement>(null!);
  let fullscreenBtn = useRef<HTMLDivElement>(null!);
  let autoLoadButton = useRef<HTMLButtonElement>(null!);
  let lastVolume: number = 1;
  let fullscreen: boolean = false;
  let playerMutedByUser = false;
  let hls: any;
  let isAutoLoad: boolean = false;

  
  const initialVideoState: VideoListType = {
    video: "",
    next: "",
    poster: "",
  };

  const [currentVideo, setcurrentVideo] = useState(initialVideoState);

  if (typeof window != "undefined") {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      handleKeypress(e);
    });
  }

  if (Hls.isSupported()) {
    hls = new Hls();
  }

  useEffect(() => {
    if (playerRef.current) {
      hls.loadSource(currentVideo.video);
      hls.attachMedia(playerRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // playerRef.current.play();
      });
    }
  });

  useEffect(() => {
    setcurrentVideo(videoList[0]);
  }, [videoList]);

  const togglePlay = (): void => {
    if (playerRef.current.paused) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
    playBtn.current.classList.toggle("paused");
    if (!playerMutedByUser) playerRef.current.muted = false;
  };

  const changeVolume = (e: any): void => {
    volumeBtn.current.classList.remove("muted");
    let volume = e.nativeEvent.offsetX / volumeSlider.current.offsetWidth;
    volume = volume < 0.1 ? 0 : volume;
    volumeFill.current.style.width = `${volume * 100}%`;
    playerRef.current.volume = volume;
    if (volume > 0.7) {
      volumeBtn.current.classList.add("loud");
    } else if (volume < 0.7 && volume > 0) {
      volumeBtn.current.classList.remove("loud");
    } else if (volume === 0) {
      volumeBtn.current.classList.add("muted");
    }
    lastVolume = volume;
  };

  const toggleMute = (): void => {
    if (playerRef.current.volume) {
      lastVolume = playerRef.current.volume;
      playerRef.current.volume = 0;
      volumeBtn.current.classList.add("muted");
      volumeFill.current.style.width = "0";
    } else {
      playerRef.current.volume = lastVolume;
      volumeBtn.current.classList.remove("muted");
      volumeFill.current.style.width = `${lastVolume * 100}%`;
    }
  };

  const neatTime = (time: number): string => {
    // let hours = Math.floor((time % 86400)/3600)
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor(time % 60);
    return `${minutes}:${seconds > 9 ? seconds : `0${seconds}`}`;
  };

  const togglePlayBtn = (): void => {
    playBtn.current.classList.toggle("playing");
  };

  const updateProgress = (): void => {
    if (!isNaN(playerRef.current.duration)) {
      progressFill.current.style.width = `${
        (playerRef.current.currentTime / playerRef.current.duration) * 100
      }%`;
      currentTimeDiv.current.innerHTML = `${neatTime(
        playerRef.current.currentTime
      )} / ${neatTime(playerRef.current.duration)}`;
    }
  };

  const setProgress = (e: any): void => {
    const newTime = e.nativeEvent.offsetX / progressSlider.current.offsetWidth;
    progressFill.current.style.width = `${newTime * 100}%`;
    playerRef.current.currentTime = newTime * playerRef.current.duration;
  };

  const launchIntoFullscreen = (element: HTMLVideoElementExt): void => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = (): void => {
    const docWithBrowsersExitFunctions = document as unknown as Document & {
      mozCancelFullScreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };
    if (
      document.fullscreenElement ||
      docWithBrowsersExitFunctions.webkitFullscreenElement ||
      docWithBrowsersExitFunctions.mozFullScreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) {
        docWithBrowsersExitFunctions.mozCancelFullScreen();
      } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) {
        docWithBrowsersExitFunctions.webkitExitFullscreen();
      }
    }
  };

  const toggleFullscreen = (): void => {
    fullscreen ? exitFullscreen() : launchIntoFullscreen(playerRef.current);
    fullscreen = !fullscreen;
  };

  const setSpeed = (e: SyntheticEvent<HTMLLIElement>): void => {
    playerRef.current.playbackRate = Number(e.currentTarget.dataset.speed);
    document.querySelectorAll(".speed-item").forEach((e) => {
      e.classList.remove("active");
    });
    e.currentTarget.classList.add("active");
  };

  const handleKeypress = (e: KeyboardEvent): void => {
    switch (e.key) {
      case " ":
        togglePlay();
        break;
      case "ArrowRight":
        playerRef.current.currentTime += 5;
        break;
      case "ArrowLeft":
        playerRef.current.currentTime -= 5;
        break;
      default:
        return;
    }
  };

  const loadVideo = (currentVideo: VideoListType): void => {
    hls.stopLoad();
    hls.detachMedia();
    setcurrentVideo(currentVideo);
    playerRef.current.src = "";
    hls.loadSource(currentVideo.video);
    hls.attachMedia(playerRef.current);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      playerRef.current.play();
    });
    playBtn.current.classList.remove("paused");
    playBtn.current.classList.add("playing");
  };

  const loadNext = (): void => {
    if (isAutoLoad && currentVideo.next.length) {
      hls.stopLoad();
      hls.detachMedia();
      const curVideo = videoList.find((v) => v.video === currentVideo.next);
      setcurrentVideo(curVideo!);
      playerRef.current.src = "";
      hls.loadSource(currentVideo.next);
      hls.attachMedia(playerRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        playerRef.current.play();
      });
    }
  };

  const handleIsAutoload = () => {
    isAutoLoad = !isAutoLoad;
    autoLoadButton.current.innerHTML = isAutoLoad ?  "ON" : 'OFF'
  };

  return (
    <div>
      <div>
        <div className="player-container">
          <div className="player">
            <video
              id="video"
              ref={(player) => (playerRef.current = player!)}
              onPlay={togglePlayBtn}
              onPause={togglePlayBtn}
              onTimeUpdate={updateProgress}
              onSeeking={() => console.log(" I am seeking")}
              onSeeked={() => console.log(" Seek ended")}
              onEnded={loadNext}
              poster="http://vjs.zencdn.net/v/oceans.png"
            />
            <div className="play-btn-big"></div>
            <div className="controls">
              <div className="time">
                <span className="time-current" ref={currentTimeDiv}></span>
                <span className="time-total" ref={textTotal}></span>
              </div>
              <div
                className="progress"
                ref={progressSlider}
                onClick={setProgress}
              >
                <div className="progress-filled" ref={progressFill}></div>
              </div>
              <div className="controls-main">
                <div className="controls-left">
                  <div className="volume">
                    <div
                      className="volume-btn loud"
                      ref={volumeBtn}
                      onClick={toggleMute}
                    >
                      <svg
                        width="26"
                        height="24"
                        viewBox="0 0 26 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.75497 17.6928H2C0.89543 17.6928 0 16.7973 0 15.6928V8.30611C0 7.20152 0.895431 6.30611 2 6.30611H6.75504L13.9555 0.237289C14.6058 -0.310807 15.6 0.151473 15.6 1.00191V22.997C15.6 23.8475 14.6058 24.3098 13.9555 23.7617L6.75497 17.6928Z"
                          transform="translate(0 0.000518799)"
                          fill="white"
                        />
                        <path
                          id="volume-low"
                          d="M0 9.87787C2.87188 9.87787 5.2 7.66663 5.2 4.93893C5.2 2.21124 2.87188 0 0 0V2C1.86563 2 3.2 3.41162 3.2 4.93893C3.2 6.46625 1.86563 7.87787 0 7.87787V9.87787Z"
                          transform="translate(17.3333 7.44955)"
                          fill="white"
                        />

                        <path
                          id="volume-high"
                          d="M0 16.4631C4.78647 16.4631 8.66667 12.7777 8.66667 8.23157C8.66667 3.68539 4.78647 0 0 0V2C3.78022 2 6.66667 4.88577 6.66667 8.23157C6.66667 11.5773 3.78022 14.4631 0 14.4631V16.4631Z"
                          transform="translate(17.3333 4.15689)"
                          fill="white"
                        />
                        <path
                          id="volume-off"
                          d="M1.22565 0L0 1.16412L3.06413 4.0744L0 6.98471L1.22565 8.14883L4.28978 5.23853L7.35391 8.14883L8.57956 6.98471L5.51544 4.0744L8.57956 1.16412L7.35391 0L4.28978 2.91031L1.22565 0Z"
                          transform="translate(17.3769 8.31403)"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div
                      className="volume-slider"
                      ref={volumeSlider}
                      onClick={(e) => changeVolume(e)}
                    >
                      <div className="volume-filled" ref={volumeFill}></div>
                    </div>
                  </div>
                </div>
                <div
                  className="play-btn paused"
                  ref={playBtn}
                  onClick={() => togglePlay()}
                ></div>
                <div className="controls-right">
                  <div className="speed">
                    <ul className="speed-list">
                      <li
                        className="speed-item"
                        data-speed="0.5"
                        onClick={setSpeed}
                      >
                        0.5x
                      </li>
                      <li
                        className="speed-item"
                        data-speed="0.75"
                        onClick={setSpeed}
                      >
                        0.75x
                      </li>
                      <li
                        className="speed-item active"
                        data-speed="1"
                        onClick={setSpeed}
                      >
                        1x
                      </li>
                      <li
                        className="speed-item"
                        data-speed="1.5"
                        onClick={setSpeed}
                      >
                        1.5x
                      </li>
                      <li
                        className="speed-item"
                        data-speed="2"
                        onClick={setSpeed}
                      >
                        2x
                      </li>
                    </ul>
                  </div>
                  <div
                    className="fullscreen"
                    ref={fullscreenBtn}
                    onClick={toggleFullscreen}
                  >
                    <svg
                      width="30"
                      height="22"
                      viewBox="0 0 30 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 0V-1.5H-1.5V0H0ZM0 18H-1.5V19.5H0V18ZM26 18V19.5H27.5V18H26ZM26 0H27.5V-1.5H26V0ZM1.5 6.54545V0H-1.5V6.54545H1.5ZM0 1.5H10.1111V-1.5H0V1.5ZM-1.5 11.4545V18H1.5V11.4545H-1.5ZM0 19.5H10.1111V16.5H0V19.5ZM24.5 11.4545V18H27.5V11.4545H24.5ZM26 16.5H15.8889V19.5H26V16.5ZM27.5 6.54545V0H24.5V6.54545H27.5ZM26 -1.5H15.8889V1.5H26V-1.5Z"
                        transform="translate(2 2)"
                        fill="white"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PlayerList loadVideo={loadVideo} list={videoList} />
      </div>
      <div className='auto-container'>
      <button ref={autoLoadButton} className='auto-load' onClick={handleIsAutoload}>
        OFF
      </button> 
      </div>
    </div>
  );
};

export default Player;
