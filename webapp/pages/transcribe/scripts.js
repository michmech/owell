function formatTimestamp(time){
  time = Math.round(time); //only whole seconds
  const mins=Math.floor(time/60);
  const secs=(time%60).toString().padStart(2, "0");
  return `(${mins}:${secs})`;
}

document.addEventListener("keydown", (ev) => {
  //Ctrl + Space:
  if(ev.ctrlKey && ev.key==" "){
    ev.preventDefault();
    const audio = document.querySelector("audio");
    if(!audio.paused){
      audio.pause();
    } else {
      audio.currentTime=document.querySelector("c-textarea").getLeftmostTime();
      audio.play();
    }
  }
  //Ctrl + M:
  if(ev.ctrlKey && ev.key=="m"){
    ev.preventDefault();
    const timestamp=formatTimestamp(document.querySelector("audio").currentTime);
    document.querySelector("c-textarea").insertTimestamp(timestamp);
  }
});

window.setTimeout(() => {
  document.querySelector("audio").addEventListener("timeupdate", (ev) => {
    const time=ev.target.currentTime;
    document.querySelector("c-textarea").hiliteSegment(time);
  });
});