window.onload = function(){
  document.querySelector("input#understand").addEventListener("change", understand);
  understand();
}

function understand(){
  const checkbox=document.querySelector("input#understand");
  const button=document.querySelector("button[type=submit]");
  button.disabled=!checkbox.checked;
  
  
}