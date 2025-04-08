export class CSpeed extends HTMLElement {

  constructor(){
    super();
    this.steps=[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4];
  }

  connectedCallback(){
    const input=this.querySelector("input[type=range]");
    input.setAttribute("min", 0);
    input.setAttribute("max", this.steps.length-1);
    input.setAttribute("value", this.steps.indexOf(1));
    input.addEventListener("input", (ev) => { this.#synchronize(); });
    this.#synchronize();
  }

  #synchronize(){
    const input=this.querySelector("input[type=range]");
    const span=this.querySelector("span.value");
    span.innerHTML=this.steps[input.value]+"&nbsp;×";
    document.querySelector("audio").playbackRate=this.steps[input.value];
  }

}
customElements.define("c-speed", CSpeed);