window.onload = function(){
  document.querySelector("input#lic").addEventListener("change", understand);
  understand();
}

function understand(){
  const checkbox=document.querySelector("input#lic");
  const button=document.querySelector("button[type=submit]");
  button.disabled=!checkbox.checked;
  
  
}