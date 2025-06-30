export class CIdentity extends HTMLElement {

  constructor(){
    super();
    this.email = this.getAttribute("email");
    this.displayName = this.getAttribute("display-name");
    this.rowid = this.getAttribute("rowid");
    this.loggedIn = this.getAttribute("logged-in")=="yes";
    this.uilang = document.querySelector("html").getAttribute("lang");
  }

  connectedCallback(){
    if(this.loggedIn){
      this.classList.add("loggedIn");
      this.querySelector(".badge .caption").innerText=this.email;
    }
    this.querySelector(".badge").addEventListener("click", (ev)=>{this.#clickBadge(ev)});
    document.addEventListener("click", (ev)=>{ this.#clickAnywhere(ev) });
  }

  #clickAnywhere(ev){
    if(!ev.target.closest("c-identity")) {
      const menu=this.querySelector("div.menu");
      if(menu) menu.remove();
    }
  }

  #clickBadge(ev){
    const menu=this.querySelector("div.menu");
    if(menu){
      menu.remove();
    } else {
      this.#showMenu();
    }
  }

  #showMenu(){
    const divMenu = document.createElement("div");
    divMenu.classList.add("menu");
    if(this.loggedIn){
      divMenu.innerHTML=`
        <div class="line headline">
          <div class="displayName">${this.displayName}</div>
          <div class="email">${this.email}</div>
        </div>
        <div class="line"><a href="/${this.uilang}/u${this.rowid}">${LOC("#yourprofile")}</a></div>
        <div class="line"><a href="/${this.uilang}/${LOC("atharraich-facal-faire|change-password")}">${LOC("#changepassword")}</a></div>
        <div class="line"><a href="/${this.uilang}/${LOC("a-amach|logout")}?to=${location}">${LOC("#logout")}</a></div>
      `;
    } else {
      divMenu.innerHTML=`
        <div class="line"><a href="/${this.uilang}/${LOC("a-steach|login")}?to=${location}">${LOC("#login")}</a></div>
        <div class="line"><a href="/${this.uilang}/${LOC("claraich|register")}">${LOC("#comejoinus")}</a></div>
      `;
    }
    this.appendChild(divMenu);
  }



}
customElements.define("c-identity", CIdentity);