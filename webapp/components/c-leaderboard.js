export class CLeaderboard extends HTMLElement {

  constructor(){
    super();
  }

  connectedCallback(){
    const html=`
      <h2>
        <span class="icon award"></span>
        <span class="text">${LOC("#heroboard")}</span>
        <span class="icon award"></span>
      </h2>
      <div class="list loading">
        <table>
          <thead>
            <tr>
              <td class="position">#</td>
              <td>${LOC("#name")}</td>
              <td colspan="3">${LOC("#wordstranscribed")}</td>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
    this.innerHTML=html;
    this.#loadData();
  }

  #loadData(){
    const uilang = document.querySelector("html").getAttribute("lang");

    fetch("/leaderboard?when="+(new Date()).toISOString()).then(resp => {
      if(resp.ok){
        resp.json().then(resp => {
          console.log(resp);
          this.querySelector("div.list").classList.remove("loading");
          const tbody = this.querySelector("tbody");
          let html="";
          resp.forEach((profile, i) => {
            html+=`<tr>
              <td class="position">${i+1}</td>
              <td>
                <a class="profile" href="/${uilang}/u${profile.rowid}">
                  <span class="headshot"><span class="icon user"></span></span>
                  <span class="name">${profile.displayName || LOC("#anonymizeduser")}</span>
                </a>
              </td>
              <td class="wordcount low">
                <span class="icon circle"></span>
                <span class="label">${LOC("#difficultylow")}</span>
                <span class="num num${profile.wordcountLow}">${profile.wordcountLow.toLocaleString("en", {useGrouping: true})}</span>
              </td>
              <td class="wordcount medium">
                <span class="icon square"></span>
                <span class="label">${LOC("#difficultymedium")}</span>
                <span class="num num${profile.wordcountMedium}">${profile.wordcountMedium.toLocaleString("en", {useGrouping: true})}</span>
              </td>
              <td class="wordcount high">
                <span class="icon diamond"></span>
                <span class="label">${LOC("#difficultyhigh")}</span>
                <span class="num num${profile.wordcountHigh}">${profile.wordcountHigh.toLocaleString("en", {useGrouping: true})}</span>
              </td>
            </tr>`;
          });
          tbody.innerHTML=html;
        });
      }
    });
  }

}
customElements.define("c-leaderboard", CLeaderboard);
