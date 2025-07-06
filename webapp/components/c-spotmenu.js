export class CSpotmenu extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    const html=`<button class="opener" title="Menu"><span class="icon ellipsis"></span></button>`;
    this.innerHTML=html;
  }

  #delete(){
    if(confirm(LOC("#abouttodeletetrack"))){
      const id=this.getAttribute("data-id");
      fetch("/delete?id="+id).then(resp => {
        if(resp.ok){
          resp.json().then(result => {
            if(result){
              this.classList.add("fade-out");
              window.setTimeout(()=>{
                this.parentNode.removeChild(this);
              }, 1000);
            }
          });
        }
      });
    }
  }

}
customElements.define("c-spotmenu", CSpotmenu);
