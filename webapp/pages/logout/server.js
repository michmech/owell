import sqlite from "better-sqlite3";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/:uilang(gd|en)/(a-amach|logout)", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;

    const redirTo=req.query.to || `/${req.params.uilang}`;
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      let userROWID = 0;
      {
        const sql=`select rowid from users where lower(email)=lower($email)`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { userROWID=row["rowid"] });
      }
      {
        const sql=`update users set sessionKey=NULL where lower(email)=lower($email)`;
        const stmt=db.prepare(sql);
        stmt.run({email, sessionKey});
      }
      logEvent(userROWID, null, `user--logout`, null);
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.clearCookie("email");
    res.clearCookie("sessionkey");
    res.redirect(redirTo);
  });

}
