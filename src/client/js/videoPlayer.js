const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

const handlePlayClick = (e) => {
  // console.log("1", video.paused);
  // if (video.paused) {
  //   console.log("2", video.paused);
  //   video.play();
  // } else {
  //   console.log("3", video.paused);
  //   video.pause();
  // }
  console.log("play clicked");
};
const handlePause = () => {
  console.log("handlePause");
  playBtn.innerText = "Play";
};
const handlePlay = () => {
  console.log("handlePlay");
  playBtn.innerText = "Pause";
};

const handleMute = (e) => {
  console.log("mute clicked");
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
