// https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
export class CTextarea extends HTMLElement {

  constructor(){
    super();
    // this.lang=this.getAttribute("lang") || "";
    // this.voice=this.getAttribute("voice") || "";
    // this.text=this.getAttribute("text") || "";
  }

  connectedCallback(){
    const h=document.createElement("pre");
    h.setAttribute("class", "backdrop");
    h.setAttribute("aria-hidden", "true");
    this.appendChild(h);
    
    const textarea=this.querySelector("textarea");
    textarea.addEventListener("input", x => {this.#hilite()}); 
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
    //hilite timestamps:
    html=html.replace(/\([0-9]+:[0-9]+\)/g, (s) => {
      return `<span class="timestamp">${s}</span>`;
    })
    const backdrop=this.querySelector(".backdrop");
    backdrop.innerHTML=html;
  }
}
customElements.define("c-textarea", CTextarea);