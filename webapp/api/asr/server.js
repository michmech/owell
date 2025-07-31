import sqlite from "better-sqlite3";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/asr", function(req, res){
    const pwd = req.header("password");
    if(pwd!=process.env.ASRAPIPWD) { res.status(401).end(); return; } //Unauthorized
    
    const result=[];

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //get sounds that don't have a pretranscript yet:
        const sql=`select id from sounds where pretranscript is null`;
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          result.push({
            id: row["id"],
            sound_file_url: process.env.URLSTART+"/getsoundfile?id="+row["id"],
          });
        });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.json(result);
  });

  app.post("/asr", function(req, res){
    if(process.env.READONLY==1){ res.status(503).end(); return; } //Service Unavailable

    const id = parseInt(req.query["id"]);
    const pwd = req.header("password");
    const payload = req.body;
    
    if(pwd!=process.env.ASRAPIPWD) { res.status(401).end(); return; } //Unauthorized
    
    let success=false;
    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //save the pretranscript:
        const sql=`update sounds set pretranscript=$payload where id=$id`;
        const stmt=db.prepare(sql);
        stmt.run({payload: JSON.stringify(payload), id});
      }
      success=true;
      logEvent(null, id, `sound__pretranscript--save`, payload);
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(!success) { res.status(500).end(); return; } //Internal Server Error
    
    res.status(200).end(); //OK
  });
  
}
