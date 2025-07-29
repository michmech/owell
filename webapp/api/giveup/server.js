import sqlite from "better-sqlite3";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/giveup", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;
    let isOwner=false;
    let userROWID = 0;

    const id = parseInt(req.query["id"]);
    let result=false;

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is logged in and is an admin:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select rowid, email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { userROWID=row["rowid"]; loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      { //check if the sound is owned and if the person is its owner:
        const sql=`select * from sounds where status='owned' and owner=$email`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { isOwner=true });
      }
      if(loggedIn && isOwner) {
        { //update the sound:
          const sql=`update sounds set status='available', owner=NULL where id=$id`;
          const stmt=db.prepare(sql);
          stmt.run({id});
        }
        logEvent(userROWID, id, `sound--giveup`, null);
        result=true;
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.json(result);
  });
  
}
