import sqlite from "better-sqlite3";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/promote", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;
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
      if(loggedIn && isAdmin) {
        { //promote the user:
          const sql=`update users set isAdmin=1 where rowid=$id`
          const stmt=db.prepare(sql);
          stmt.run({id});
        }
        logEvent(userROWID, null, `user--promote-to-admin`, {affected_user_rowid: id});
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
