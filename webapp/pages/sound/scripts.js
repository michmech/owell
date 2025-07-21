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
  //Ctrl + "<":
  if(ev.ctrlKey && (ev.key=="," || ev.key=="<")){
    ev.preventDefault();
    const audio=document.querySelector("audio");
    audio.currentTime = audio.currentTime-1;
  }
  //Ctrl + "<":
  if(ev.ctrlKey && (ev.key=="." || ev.key==">")){
    ev.preventDefault();
    const audio=document.querySelector("audio");
    audio.currentTime = audio.currentTime+1;
  }
});

window.setTimeout(() => {
  document.querySelector("audio").addEventListener("timeupdate", (ev) => {
    const time=ev.target.currentTime;
    if(document.querySelector("c-textarea")){
      document.querySelector("c-textarea").hiliteSegment(time);
    }
  });
  document.querySelector("audio").addEventListener("durationchange", (ev) => {
    updateDuration();
  });
  updateDuration();
});

function updateDuration(){
  const input=document.querySelector("input[name=duration]");
  if(input){
    const prevKnownDuration=parseFloat(input.value);
    const duration=document.querySelector("audio").duration;
    if(duration > prevKnownDuration) input.value=duration;
  }
}

function hideGuidelink(){
  document.querySelector("form div.guidelink").style.display="none";
  document.querySelector("textarea").focus();
}