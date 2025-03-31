const LOC=function(multistring, uilang){
  uilang = uilang || document.querySelector("html").getAttribute("lang");
  const arr=multistring.split("|");
  if(uilang=="ga" && arr.length>0) return arr[0];
  if(uilang=="en" && arr.length>1) return arr[1];
  return multistring;
};
