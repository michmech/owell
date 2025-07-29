export class CStrangermenu extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    const html=`<button class="opener" title="${LOC("#menu")}"><span class="icon ellipsis"></span></button>`;
    this.innerHTML=html;

    this.querySelector(".opener").addEventListener("click", (ev)=>{this.#clickOpener(ev)});
    document.addEventListener("click", (ev)=>{ this.#clickAnywhere(ev) });
  }

  #clickAnywhere(ev){
    if(ev.target.closest("c-strangermenu")!=this ) {
      const menu=this.querySelector("div.menu");
      if(menu) menu.remove();
    }
  }

  #clickOpener(ev){
    const menu=this.querySelector("div.menu");
    if(menu){
      menu.remove();
    } else {
      this.#showMenu();
    }
  }

  #showMenu(){
    const uilang = document.querySelector("html").getAttribute("lang");
    const divMenu = document.createElement("div");
    divMenu.classList.add("menu");
    if(this.getAttribute("is-admin")=="yes"){
      divMenu.innerHTML=`
        <div class="line"><button class="demotefromadmin"><span class="icon xmark"></span> ${LOC("#demotefromadmin")}</button></div>
      `;
      divMenu.querySelector("button.demotefromadmin").addEventListener("click", (ev)=>{ this.#demote(); });
    } else {
      divMenu.innerHTML=`
        <div class="line"><button class="promotetoadmin"><span class="icon circle-check"></span> ${LOC("#promotetoadmin")}</button></div>
      `;
      divMenu.querySelector("button.promotetoadmin").addEventListener("click", (ev)=>{ this.#promote(); });
    }
    this.appendChild(divMenu);
  }

  #promote(){
    const id=this.getAttribute("user-rowid");
    fetch("/promote?id="+id).then(resp => {
      if(resp.ok){
        resp.json().then(result => {
          if(result){
            location.reload();
          }
        });
      }
    });
  }

  #demote(){
    const id=this.getAttribute("user-rowid");
    fetch("/demote?id="+id).then(resp => {
      if(resp.ok){
        resp.json().then(result => {
          if(result){
            location.reload();
          }
        });
      }
    });
  }


}
customElements.define("c-strangermenu", CStrangermenu);
