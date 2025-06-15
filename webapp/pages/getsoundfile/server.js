import fs from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";

export default function(app, L, do404, rootdir){

  app.get("/getsoundfile", async function(req, res){
    const id = req.query["id"];
    const url = "https://digitalpreservation.is.ed.ac.uk/bitstream/handle/20.500.12734/29585/SOSS_003321_021264.mp4";
    
    const ext = path.extname(url);
    const filename = id+"."+ext;
    
    let exists;
    try{
      await fs.access(`./sounds/${filename}`);
      exists = true;
    } catch(e){
      exists = false;
    }

    if(!exists){
      const response = await fetch(url);
      const stream = Readable.fromWeb(response.body);
      await fs.writeFile(`./sounds/${filename}`, stream);
    }

    res.redirect(`/sounds/${filename}`);
  });
  
}