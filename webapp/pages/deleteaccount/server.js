import sqlite from "better-sqlite3";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  //the form, before submission:
  app.get("/:uilang(gd|en)/(cuir-as-cunntas|delete-account)", function(req, res){
    if(process.env.READONLY==1){ doReadOnly(req, res); return; }

    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"]; });
      }
      if(process.env.READONLY==1) loggedIn=false;
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(!loggedIn){
      res.redirect(`/${req.params.uilang}/${L(req.params.uilang, "a-steach|login")}?to=${req.path}`);
    } else {
      res.render("deleteaccount/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName,
        userROWID,
        loggedIn,
        email,
  
        L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/cuir-as-cunntas",
          "en": "/en/delete-account",
        },
        isHomepage: false,
        
        deleteAttempted: false,
      });
    }

  });

  //the form, after submission:
  app.post("/:uilang(gd|en)/(cuir-as-cunntas|delete-account)", function(req, res){
    if(process.env.READONLY==1){ doReadOnly(req, res); return; }

    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"]; });
      }
      if(process.env.READONLY==1) loggedIn=false;
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(!loggedIn){
      res.redirect(`/${req.params.uilang}/${L(req.params.uilang, "a-steach|login")}?to=${req.path}`);
    } else {

      const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
      try{
        const anonymizedEmail = userROWID+"@anonymous.invalid";
        { //anonymize the account:
          const sql=`update users set email=$anonymizedEmail, displayName='', bio='' where rowid=$userROWID`;
          const stmt=db.prepare(sql);
          stmt.run({anonymizedEmail, userROWID});
        }
        logEvent(userROWID, null, `user--selfdelete`, null);
        { //any status=owned sounds belonging to this user, make them status=available:
          const sql=`update sounds set status='available' where owner=$email and status='owned'`;
          const stmt=db.prepare(sql);
          stmt.run({email});
        }
        { //all sounds belonging to this user, make them belong to the anonymized user from now on:
          const sql=`update sounds set owner=$anonymizedEmail where owner=$email`;
          const stmt=db.prepare(sql);
          stmt.run({anonymizedEmail, email});
        }
      } catch(e){
        console.log(e);
      } finally {
        db.close();
      }
      res.redirect(`/${req.params.uilang}`);
  
    }
  });
}

