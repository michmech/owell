import sqlite from "better-sqlite3";
import fs from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/getsoundfile", async function(req, res){
    const id = req.query["id"];
    let url = "";

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      const sql=`select s.url from sounds as s where s.id=$id`
      const stmt=db.prepare(sql);
      stmt.all({id}).map(row => { url = row["url"] });
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(url){
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
    } else {
      do404();
    }
  });

}