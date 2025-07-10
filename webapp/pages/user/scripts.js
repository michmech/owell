window.onload = function(){
  loadSounds();
}

function loadSounds(){
  const div = document.querySelector("div.sounds");
  const rowid = document.querySelector("body").getAttribute("data-rowid");
  fetch("/list?queryName=theirs&rowid="+rowid+"&when="+(new Date()).toISOString()).then(resp => {
    if(resp.ok){
      resp.json().then(resp => {
        div.classList.remove("loading");
        
        resp.sounds.forEach(sound => {
          const listing=document.createElement("c-listing");
          listing.classList.add("fade-in");
          if(sound.prominent) listing.classList.add("prominent");
          listing.setAttribute("data-admin", resp.isAdmin ? "1" : "0");
          listing.setAttribute("data-id", sound.id);
          listing.setAttribute("data", JSON.stringify(sound));
          document.querySelector("div.sounds").appendChild(listing);
        });

      });
    }
  });
}