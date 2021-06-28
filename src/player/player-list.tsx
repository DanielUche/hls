import React from "react";
import { VideoListType } from "../types";

type Props = {
  loadVideo: (video: VideoListType) => void;
  list: VideoListType[];
};

const PlayerList = ({ loadVideo, list }: Props) => {
  return (
    <div className="list-div">
      <ul>
        {list.map((item, i) => (
          <li key={`video-item-${i}`}>
            <a href="/#" data-url={item} onClick={(e) => loadVideo(item)}>
              <img src="/posters/title_anouncement.jpg" alt='' />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
