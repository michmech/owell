export class CSpotmenu extends HTMLElement {

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
    if(ev.target.closest("c-spotmenu")!=this ) {
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
    const divMenu = document.createElement("div");
    divMenu.classList.add("menu");
    divMenu.innerHTML=`
      <div class="line"><button data-difficulty="low" class="difficulty low"><span class="icon circle"></span> ${LOC("#difficultylow")}</button></div>
      <div class="line"><button data-difficulty="medium" class="difficulty medium"><span class="icon square"></span> ${LOC("#difficultymedium")}</button></div>
      <div class="line"><button data-difficulty="high" class="difficulty high"><span class="icon diamond"></span> ${LOC("#difficultyhigh")}</button></div>
      <div class="line"><button class="giveup"><span class="icon xmark"></span> ${LOC("#giveup")}</button></div>
      <div class="line"><button class="delete"><span class="icon trash-can"></span> ${LOC("#delete")}</button></div>
    `;

    divMenu.querySelectorAll(".difficulty").forEach(button => {
      button.addEventListener("click", (ev)=>{
        const difficulty=ev.target.closest("button").getAttribute("data-difficulty");
        this.#difficulty(difficulty);
      });
    });
    divMenu.querySelector(".delete").addEventListener("click", (ev)=>{ this.#delete(); });
    divMenu.querySelector(".giveup").addEventListener("click", (ev)=>{ this.#giveup(); });

    if(this.getAttribute("show-difficulty")!="yes") divMenu.querySelectorAll(".difficulty").forEach(x => x.closest(".line").remove());
    if(this.getAttribute("show-giveup")!="yes") divMenu.querySelector(".giveup").closest(".line").remove();
    if(this.getAttribute("show-delete")!="yes") divMenu.querySelector(".delete").closest(".line").remove();

    this.appendChild(divMenu);
  }

  #difficulty(difficulty){
    const el=this.closest(".menuspot").querySelector(".difficulty");
    el.classList.remove("fade-in");            
    el.classList.add("grey");
    const id=this.getAttribute("sound-id");
    fetch("/difficulty?id="+id+"&difficulty="+difficulty).then(resp => {
      if(resp.ok){
        resp.json().then(result => {
          if(result){
            el.className="difficulty";
            el.classList.add(difficulty);            
            el.classList.add("fade-in");            
          }
        });
      }
    });
  }

  #delete(){
    if(confirm(LOC("#abouttodeletetrack"))){
      const id=this.getAttribute("sound-id");
      fetch("/delete?id="+id).then(resp => {
        if(resp.ok){
          resp.json().then(result => {
            if(result){
              const listing=this.closest("c-listing");
              if(listing){
                listing.classList.add("fade-out");
                window.setTimeout(()=>{
                  listing.parentNode.removeChild(listing);
                }, 1000);
              } else {
                const uilang = document.querySelector("html").getAttribute("lang");
                location = "/"+uilang;
              }
            }
          });
        }
      });
    }
  }

  #giveup(){
    const id=this.getAttribute("sound-id");
    fetch("/giveup?id="+id).then(resp => {
      if(resp.ok){
        resp.json().then(result => {
          if(result){
            const listing=this.closest("c-listing");
            if(listing){
              // document.querySelector("div.tabs button.current").click(); 
              location.reload();
            } else {
              location.reload();
            }
          }
        });
      }
    });
  }

}
customElements.define("c-spotmenu", CSpotmenu);
