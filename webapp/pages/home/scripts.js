const icon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" fill="#5899b8" stroke="#ffffff" stroke-width="30" viewBox="0 0 384 512"><path d="M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0s192 86 192 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.5 0zM192 272c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80z"/></svg>`,
  className: "",
  iconSize: [18, 30],
  iconAnchor: [9, 30],
});
const iconHi = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" fill="#02293b" stroke="#ffffff" stroke-width="30" viewBox="0 0 384 512"><path d="M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0s192 86 192 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.5 0zM192 272c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80z"/></svg>`,
  className: "",
  iconSize: [20, 34],
  iconAnchor: [10, 34],
});

const markers = {}; //nickname => L.marker

$(document).ready(function() {   
  map.fitBounds(BOUNDS_MIDBELT);

  document.querySelectorAll("li.area").forEach(li => {
    const nickname = li.getAttribute("data-nickname");
    li.addEventListener("mouseover", ()=>{hilite(nickname)});
    li.addEventListener("mouseout", ()=>{unhilite(nickname)});

    const latlon = [li.getAttribute("data-lat"), li.getAttribute("data-lon")];
    const title = li.getAttribute("data-name");
    const alt = LOC("spota léarscáile|map marker");
    const marker = L.marker(latlon, {icon: icon, title: title, alt: alt, riseOnHover: true});
    marker.addTo(map);
    markers[nickname] = marker;
    marker.on("mouseover", ()=>{hilite(nickname)} );
    marker.on("mouseout", ()=>{unhilite(nickname)} );
    marker.on("click", ()=>{navigate(nickname)} );
  });
});

let maxZ = 100;
let lastHilitedNickname = ""
function hilite(nickname){
  if(nickname != lastHilitedNickname){
    maxZ=maxZ+100; markers[nickname].setIcon(iconHi).setZIndexOffset(maxZ);
    document.querySelector(`li.area[data-nickname="${nickname}"]`).classList.add("hi");
    lastHilitedNickname = nickname;
  }
}
function unhilite(nickname){
  markers[nickname].setIcon(icon);
  document.querySelector(`li.area[data-nickname="${nickname}"]`).classList.remove("hi");
  if(nickname == lastHilitedNickname) lastHilitedNickname = "";
}
function navigate(nickname){
  document.querySelector(`li.area[data-nickname="${nickname}"] a`).click();
}