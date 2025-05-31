export class CTextarea extends HTMLElement {

  constructor(){
    super();
    this.isPublic=(this.getAttribute("public")=="yes");
  }

  connectedCallback(){
    const h=document.createElement("pre");
    h.setAttribute("class", "backdrop");
    h.setAttribute("aria-hidden", "true");
    this.appendChild(h);
    
    const textarea=this.querySelector("textarea");
    if(this.isPublic){
      textarea.readOnly=true;
    } else {
      textarea.addEventListener("input", x => {this.#hilite()}); 
    }
    textarea.addEventListener("scroll", x => {this.#syncScroll()}); 
    
    this.#hilite();
    this.#syncScroll();
  }

  #syncScroll(){
    const textarea=this.querySelector("textarea");
    const backdrop=this.querySelector(".backdrop");
    backdrop.scrollTop=textarea.scrollTop;
  }

  #hilite(){
    const textarea=this.querySelector("textarea");
    let html=textarea.value;
    //escape angle brackets:
    html=html.replace(/\</g, "&lt;").replace(/\>/g, "&rt;");
    //forcefully unignore trailing newline, if present:
    if(html[html.length-1]=="\n") html+=" ";
    //markup timestamps and segments:
    const frags = html.split(/(\([0-9]+:[0-9]+\))/);
    html = "";
    let time=0;
    frags.map((frag, i) => {
      if(/\(([0-9]+):([0-9]+)\)/.test(frag)){
        html+=`<span class="timestamp">${frag}</span>`
        frag.replace(/\(([0-9]+):([0-9]+)\)/g, (s, mins, secs) => {
          time = parseInt(mins)*60 + parseInt(secs);
        })
      } else {
        html+=`<span class="segment" data-start-time="${time}">${frag}</span>`;
      }
    });

    const backdrop=this.querySelector(".backdrop");
    backdrop.innerHTML=html;
  }

  insertTimestamp(timestamp){
    const textarea=document.querySelector("textarea");
    let before=textarea.value.substring(0, textarea.selectionStart);
    let after=textarea.value.substring(textarea.selectionEnd);
    //add spaces around timestamp if needed: 
    if(before.length>0 && /[^\s\n]$/.test(before)) timestamp=" "+timestamp;
    if(after.length>0 && /^[^\s\n\r\,\.\!\?\:]/.test(after)) timestamp=timestamp+" ";
    //insert timestamp into textarea:
    textarea.focus();
    if(document.execCommand){ //deprecated but does not break undo
      document.execCommand("insertText", false, timestamp);
    } else { //modern but breaks undo
      textarea.value=before+timestamp+after;
      textarea.selectionStart=before.length+timestamp.length;
      textarea.selectionEnd=before.length+timestamp.length;
      this.#hilite();
    }
  }

  getLeftmostTime(){
    const textarea=document.querySelector("textarea");
    let before=textarea.value.substring(0, textarea.selectionStart);
    let time=0;
    before.replace(/\(([0-9]+):([0-9]+)\)/g, (s, mins, secs) => {
      time = parseInt(mins)*60 + parseInt(secs);
    })
    return time;
  }

  hiliteSegment(time){
    let segment=null;
    this.querySelectorAll(".backdrop span.segment").forEach(span => {
      span.classList.remove("hilited");
      if(time >= parseFloat(span.getAttribute("data-start-time"))) segment=span;
    });
    if(segment) segment.classList.add("hilited");
  }

}
customElements.define("c-textarea", CTextarea);