import React, { useEffect, useRef, useState, SyntheticEvent } from "react";

import Player from "./player/player";
import "./App.css";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const loadVideo = (e: SyntheticEvent<HTMLAnchorElement>) => {
      setVideoUrl(String(e.currentTarget.dataset.url));
      console.log(videoUrl);
  };
  return (
    <div className="App">
      <div className="app-container">
        <Player videoUrl={videoUrl}/>
        <div className="list-div">
          <a
            href="/#"
            data-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
            onClick={(e) =>
              loadVideo(e)
            }
          >
           Placehlder Video One
          </a>
          <a
            href="/#"
            data-url="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
            onClick={(e) =>
              loadVideo(e)
            }
          >
           Placehlder Video Two
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
