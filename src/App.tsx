import React from "react";

import Player from "./player/player";
import "./App.css";

function App() {
  const videoList = [
    {
      video: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      poster: "title_anouncement.jpg",
    },
    {
      video:
        "http://devimages.apple.com/iphone/samples/bipbop/gear1/prog_index.m3u8",
      poster: "title_anouncement.jpg",
    },
    {
      video: "http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8",
      poster: "title_anouncement.jpg",
    },
    {
      video: "http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8",
      poster: "title_anouncement.jpg",
    },
    {
      video: "http://content.jwplatform.com/manifests/vM7nH0Kl.m3u8",
      poster: "title_anouncement.jpg",
    },
  ];
  return (
    <div className="App">
      <div className="app-container">
        <Player videoList={videoList} />
      </div>
    </div>
  );
}

export default App;
