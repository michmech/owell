export class CAdder extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    let html=`
      <div class="adder">
        <div class="title">${LOC("#addanewtrack")}</div>
        <form>
          <label>
            <span class="label">${LOC("#trackid")}</span>
            <input id="trackID"/>
          </label>
          <button type="submit">${LOC("#go")}</button>
          <span id="spinner" style="display: none"></span>
          <span id="error" style="display: none"></span>
        </form>
      </div>
    `;
    this.innerHTML=html;
    this.querySelector("form").addEventListener("submit", (ev)=>{ ev.preventDefault(); this.#go(); });
  }

  #go(){
    let trackID = this.querySelector("input#trackID").value;
    if(trackID && (trackID=parseInt(trackID))){
      this.querySelector("input#trackID").disabled=true;
      this.querySelector("button[type='submit']").disabled=true;
      this.querySelector("#spinner").style.display="inline-block";
      this.querySelector("#error").style.display="none";
      fetch("/tadget?id="+trackID).then(resp => {
        if(!resp.ok){
          this.#error("#errorhasoccurred");
        } else {
          resp.json().then(resp => {
            if(resp.error){
              this.#error(resp.error);
            } else {
              this.#reset();
              resp.sounds.forEach(sound => {
                const listing=document.createElement("c-listing");
                listing.setAttribute("class", "fade-in");
                listing.setAttribute("data-admin", "1");
                listing.setAttribute("data-id", sound.id);
                listing.setAttribute("data", JSON.stringify(sound));
                document.querySelector("div.sounds").appendChild(listing);
              });
            }
          });
        }
      });
    }
  }

  #error(error){
    this.querySelector("#spinner").style.display="none";
    this.querySelector("#error").innerText=LOC(error);
    this.querySelector("#error").style.display="inline-block";
    this.querySelector("input#trackID").disabled=false;
    this.querySelector("button[type='submit']").disabled=false;
  }

  #reset(){
    this.querySelector("input#trackID").value="";
    this.querySelector("#spinner").style.display="none";
    this.querySelector("#error").innerText="";
    this.querySelector("#error").style.display="none";
    this.querySelector("input#trackID").disabled=false;
    this.querySelector("button[type='submit']").disabled=false;
  }

}
customElements.define("c-adder", CAdder);
