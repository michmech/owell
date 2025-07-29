export class CListing extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    const uilang = document.querySelector("html").getAttribute("lang");
    const id=this.getAttribute("data-id");
    const isAdmin=(this.getAttribute("data-admin")=="1");
    const isProminent=this.classList.contains("prominent");
    const sound=JSON.parse(this.getAttribute("data"));

    let html="";

    html+=`<span class="status">`;
      html+=`<span class="dots">`;
        if(sound.status=="available") html+=`<span class="blanks">● ● ●</span>`;
        if(sound.status=="owned") html+=`● <span class="blanks">● ●</span>`;
        if(sound.status=="finished") html+=`● ● <span class="blanks">●</span>`;
        if(sound.status=="approved") html+=`● ● ●`;
      html+=`</span> `;
      if(sound.status=="available") html+=`${LOC("#available")}`;
      if(sound.status=="owned") html+=`${LOC("#owned")} <a class="owner" href="/${uilang}/u${sound.ownerROWID}">${sound.ownerDisplayName || LOC("#anonymizeduser")}</a>`;
      if(sound.status=="finished") html+=`${LOC("#finished", 0)}<a class="owner" href="/${uilang}/u${sound.ownerROWID}">${sound.ownerDisplayName || LOC("#anonymizeduser")}</a>${LOC("#finished", 1)}`;
      if(sound.status=="approved") html+=`${LOC("#approved", 0)}<a class="owner" href="/${uilang}/u${sound.ownerROWID}">${sound.ownerDisplayName || LOC("#anonymizeduser")}</a>${LOC("#approved", 1)}`;
    html+=`</span>`;

    html+=`<span class="menuspot">`;
      html+=`<span class="difficulty ${sound.difficulty}">`;
        html+=`<span class="low"><span class="icon circle"></span> ${LOC("#difficultylow")}</span>`;
        html+=`<span class="medium"><span class="icon square"></span> ${LOC("#difficultymedium")}</span>`;
        html+=`<span class="high"><span class="icon diamond"></span> ${LOC("#difficultyhigh")}</span>`;
      html+=`</span>`;
      if(isAdmin || (isProminent && sound.status=='owned')){
        html+=` <c-spotmenu
          sound-id="${id}"
          show-difficulty="${isAdmin ? 'yes' : 'no'}"
          x-show-history="${isProminent || isAdmin ? 'yes' : 'no'}"
          show-giveup="${isProminent && sound.status=='owned' ? 'yes' : 'no'}"
          show-delete="${isAdmin ? 'yes' : 'no'}"
        "></c-spotmenu>`;
      }
    html+=`</span>`;

    html+=`<div class="title">`;
      html+=`<a href="/${uilang}/${sound.id}">`;
        html+=`“${sound.title}”`;
        if(sound.year) html+=` <span class="year">(${LOC("#year").toUpperCase()} ${sound.year})</span>`;
      html+=`</a>`;
    html+=`</div>`;

    html+=`<div class="data">`;
      if(sound.partNumber>0){
        html+=`<span class="part">${LOC("#part")} ${sound.partNumber}</span>`;
        html+=` <span class="divider">&middot;</span> `;
      }
      if(sound.speakers.length>0){
        html+=`${LOC("#speaking")}: `;
        for(let i=0; i<sound.speakers.length; i++){
          html+=`<a target="_blank" href="https://www.tobarandualchais.co.uk/person/${sound.speakers[i].id}?l=${uilang}">`;
            html+=`${sound.speakers[i].name}`;
            if(sound.speakers[i].lifetime) html+=` (${sound.speakers[i].lifetime})`;
          html+=`</a>`;
          if(i<sound.speakers.length-1) html+=`, `;
        }
      }

      if(sound.speakers.length>0 && sound.fieldworkers.length>0){
        html+=` <span class="divider">&middot;</span> `;
      }
      
      if(sound.fieldworkers.length>0){
        if(sound.fieldworkers.length==1){
          html+=`${LOC("#fieldworker")}: `;
        } else {
          html+=`${LOC("#fieldworkers")}: `;
        }
        for(let i=0; i<sound.fieldworkers.length; i++){
          html+=`<a target="_blank" href="https://www.tobarandualchais.co.uk/person/${sound.fieldworkers[i].id}?l=${uilang}">`;
            html+=`${sound.fieldworkers[i].name}`;
            if(sound.fieldworkers[i].lifetime) html+=` (${sound.fieldworkers[i].lifetime})`;
          html+=`</a>`;
          if(i<sound.fieldworkers.length-1) html+=`, `;
        }
      }
    html+=`</div>`;

    html+=`<a href="/${uilang}/${sound.id}" class="button">`;
      if(isProminent && sound.status=="owned") html+=`${LOC("#continuetranscribing")}`;
      else if(isAdmin && sound.status=="finished") html+=`${LOC("#review")}`;
      else if(isProminent && sound.status=="finished") html+=`${LOC("#open")}`;
      else if(sound.status=="available") html+=`${LOC("#open")}`;
      else if(sound.status=="owned") html+=`${LOC("#listen")}`;
      else if(sound.status=="finished") html+=`${LOC("#listen")}`;
      else if(sound.status=="approved") html+=`${LOC("#listenandread")}`;
      html+=`&nbsp;»`;
    html+=`</a>`;

    this.innerHTML=html;
  }
}
customElements.define("c-listing", CListing);