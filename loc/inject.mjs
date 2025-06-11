import fs from "fs/promises";

const serversidejson={};
const clientsidejson={};

let buffer=[];
(await fs.readFile("./strings.txt", "utf8")).split("\n").forEach(line => {
  line=line.trim();
  if(line==""){
    processBuffer(buffer);
    buffer=[];
  } else {
    buffer.push(line);
  }
});

function processBuffer(buffer){
  if(buffer.length==3 && buffer[0].startsWith("#")){
    const isClientSide=buffer[0].startsWith("##");
    const key=buffer[0].replace("##", "#");
    serversidejson[key]={"en": buffer[1], "gd": buffer[2]};
    if(isClientSide) clientsidejson[key]={"en": buffer[1], "gd": buffer[2]};
  }
}

await fs.writeFile("../webapp/strings.json", JSON.stringify(serversidejson, null, "  "), "utf8");
await fs.writeFile("../webapp/includes/headContent/strings.js", "const STRINGS = "+JSON.stringify(clientsidejson, null, "  ")+";", "utf8");
