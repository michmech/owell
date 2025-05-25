export class CIdentity extends HTMLElement {

  constructor(){
    super();
    this.email = this.getAttribute("email");
    this.loggedIn = this.getAttribute("loggedIn")=="yes";
    this.uilang = document.querySelector("html").getAttribute("lang");
  }

  connectedCallback(){
    if(this.loggedIn){
      this.classList.add("loggedIn");
      this.querySelector(".badge .caption").innerText=this.email;
    }
    this.querySelector(".badge").addEventListener("click", (ev)=>{this.#clickBadge()});
  }

  #clickBadge(){
    const menu=this.querySelector("div.menu");
    if(menu){
      menu.parentElement.removeChild(menu);
    } else {
      this.#showMenu();
    }
  }

  #showMenu(){
    const divMenu = document.createElement("div");
    divMenu.classList.add("menu");
    if(this.loggedIn){
      divMenu.innerHTML=`
        <div class="line email">${this.email}</div>
        <div class="line"><a href="/${this.uilang}/${LOC("atharraich-facal-faire|change-password")}">${LOC("Atharraich am facal-faire agad|Change your password")}</a></div>
        <div class="line"><a href="/${this.uilang}/${LOC("a-amach|logout")}?to=${location}">${LOC("Log a-mach|Log out")}</a></div>
      `;
    } else {
      divMenu.innerHTML=`
        <div class="line"><a href="/${this.uilang}/${LOC("a-steach|login")}?to=${location}">${LOC("Log a-steach|Log in")}</a></div>
        <div class="line"><a href="/${this.uilang}/${LOC("claraich|signup")}">${LOC("Cruthaich cunntas ùr|Create a new account")}</a></div>
      `;
    }
    this.appendChild(divMenu);
  }



}
customElements.define("c-identity", CIdentity);