// https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/
export class CTextarea extends HTMLElement {

  constructor(){
    super();
    // this.lang=this.getAttribute("lang") || "";
    // this.voice=this.getAttribute("voice") || "";
    // this.text=this.getAttribute("text") || "";
  }

  connectedCallback(){
    const h=document.createElement("div");
    h.setAttribute("class", "backdrop");
    h.setAttribute("aria-hidden", "true");
    this.appendChild(h);
    
    const textarea=this.querySelector("textarea");
    textarea.addEventListener("input", x => {this.hilite()}); 
    
    this.hilite();
  }

  hilite(){
    const textarea=this.querySelector("textarea");
    const text=textarea.value;
    const html=text.replace(/\([0-9]+:[0-9]+\)/g, (s) => {
      return `<span class="timestamp">${s}</span>`;
    })
    const backdrop=this.querySelector("div.backdrop");
    backdrop.innerHTML=html;
  }
}
customElements.define("c-textarea", CTextarea);