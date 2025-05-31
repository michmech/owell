export class CAudio extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    const button=document.createElement("button");
    button.classList.add("the");
    button.classList.add("play");
    button.innerHTML=`<span class="icon play"></span><span class="icon pause"></span>`;
    this.appendChild(button);
    button.addEventListener("click", (ev)=>{ this.#buttonClick(ev); });

    const audio=document.querySelector("audio");
    audio.addEventListener("play", (ev)=>{
      button.classList.remove("play");
      button.classList.add("pause");
    });
    audio.addEventListener("pause", (ev)=>{
      button.classList.remove("pause");
      button.classList.add("play");
    });

    const time=document.createElement("span");
    time.classList.add("time");
    time.innerHTML=`<span class="now">0:00</span><span class="slash">/</span><span class="duration">0:00</span>`;
    this.appendChild(time);

    audio.addEventListener("durationchange", (ev)=>{ this.#timeUpdate(ev); });
    audio.addEventListener("timeupdate", (ev)=>{ this.#timeUpdate(ev); });

    const thermo=document.createElement("div");
    thermo.classList.add("thermo");
    thermo.innerHTML=`<div class="inside"><div class="fill"></div></div>`;
    this.appendChild(thermo);

    thermo.addEventListener("click", (ev)=>{ this.#hermoClick(ev) });
  }

  #buttonClick(ev){
    const audio=document.querySelector("audio");
    if(!audio.paused) audio.pause(); else audio.play();
  }

  #formatTime(time){
    time = Math.round(time); //only whole seconds
    const mins=Math.floor(time/60);
    const secs=(time%60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
    }

  #timeUpdate(ev){
    const time_s=ev.target.currentTime;
    const time=this.#formatTime(time_s);
    const duration_s=ev.target.duration;
    const duration=this.#formatTime(duration_s);
    this.querySelector("span.time span.now").innerHTML=time;
    this.querySelector("span.time span.duration").innerHTML=duration;
    this.querySelector("div.thermo div.fill").style.width=((time_s/duration_s)*100)+"%";
  }

  #hermoClick(ev){
    const thermo=this.querySelector("div.thermo");
    const audio=this.querySelector("audio");
    audio.currentTime=(ev.offsetX/thermo.offsetWidth)*audio.duration;
  }

}
customElements.define("c-audio", CAudio);