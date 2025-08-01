export class CUsermenu extends HTMLElement {

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
    if(ev.target.closest("c-usermenu")!=this ) {
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
    divMenu.innerHTML=`
      <div class="line"><a class="edit" href="/${uilang}/${LOC("atharraich-proifil|edit-profile")}"><span class="icon gear"></span> ${LOC("#edityourprofile")}</a></div>
      <div class="line"><a class="delete" href="/${uilang}/${LOC("cuir-as-cunntas|delete-account")}"><span class="icon trash-can"></span> ${LOC("#deleteyouraccount")}</a></div>
    `;

    this.appendChild(divMenu);
  }

}
customElements.define("c-usermenu", CUsermenu);
