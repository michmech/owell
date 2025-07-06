window.onload = function(){
  document.querySelectorAll("div.tabs button").forEach(button => {
    button.addEventListener("click", (ev) => { clickTab(ev.target.closest("button")); })
  });
  document.querySelector("div.tabs button").click(); 
}

function clickTab(button){
  document.querySelectorAll("div.tabs button").forEach(b => {
    b.classList.remove("current");
  });
  button.classList.add("current");
  const queryName = button.getAttribute("data-query");

  document.querySelector("div.nojoy").style.display="none";

  const div = document.querySelector("div.sounds");
  div.innerHTML="";
  div.classList.add("loading");

  const adder = document.querySelector("c-adder");
  if(adder) adder.style.display = "none";

  fetch("/list?queryName="+queryName+"&when="+(new Date()).toISOString()).then(resp => {
    if(resp.ok){
      resp.json().then(resp => {
        div.classList.remove("loading");
        
        resp.sounds.forEach(sound => {
          const listing=document.createElement("c-listing");
          // listing.setAttribute("class", "fade-in");
          listing.classList.add("fade-in");
          if(sound.prominent) listing.classList.add("prominent");
          listing.setAttribute("data-admin", resp.isAdmin ? "1" : "0");
          listing.setAttribute("data-id", sound.id);
          listing.setAttribute("data", JSON.stringify(sound));
          document.querySelector("div.sounds").appendChild(listing);
        });

        if(resp.sounds.length==0){
          document.querySelector("div.nojoy").style.display="block";
        }
        
        if(adder && queryName=="available") adder.style.display = "block";
      });
    }
  });
  
}
