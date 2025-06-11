const LOC=function(multistring, subpart){
  const uilang = document.querySelector("html").getAttribute("lang");
  if(multistring.startsWith("#")){
    let string=multistring
    if(STRINGS[multistring] && STRINGS[multistring][uilang]) string=STRINGS[multistring][uilang];
    subpart = subpart || 0;
    const substrings=string.split("$");
    if(substrings.length>subpart) return substrings[subpart];
    return string;
  }
  const arr=multistring.split("|");
  if(uilang=="gd" && arr.length>0) return arr[0];
  if(uilang=="en" && arr.length>1) return arr[1];
  return multistring;
};
