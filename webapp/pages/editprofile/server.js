import sqlite from "better-sqlite3";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  //the form, before submission:
  app.get("/:uilang(gd|en)/(atharraich-proifil|edit-profile)", function(req, res){
    if(process.env.READONLY==1){ doReadOnly(req, res); return; }

    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    let displayName="";
    let bio="";
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin, bio from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"]; displayName=userDisplayName; bio=row["bio"]; });
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
      res.render("editprofile/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName,
        userROWID,
        loggedIn,
        email,
  
        L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/atharraich-proifil",
          "en": "/en/edit-profile",
        },
        isHomepage: false,
        
        updateAttempted: false,
        updateFailed: false,
        displayName,
        bio,
      });
    }

  });

  //the form, after submission:
  app.post("/:uilang(gd|en)/(atharraich-proifil|edit-profile)", function(req, res){
    if(process.env.READONLY==1){ doReadOnly(req, res); return; }

    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    let displayName=req.body.displayName;
    let bio=req.body.bio;

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
      let updateFailed = false; 
      if(!updateFailed && displayName.trim()==""){
        updateFailed = "#displaynamemustnotbeblank";
      }

      if(!updateFailed){
        const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
        try{
          { //sav the user's new prifile content:
            let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
            const sql=`update users set displayName=$displayName, bio=$bio where lower(email)=lower($email)`;
            const stmt=db.prepare(sql);
            stmt.run({email, displayName, bio});
          }
          logEvent(userROWID, null, `user__profile--edit`, {displayName, bio});
        } catch(e){
          console.log(e);
        } finally {
          db.close();
        }
        res.redirect(`/${req.params.uilang}/u${userROWID}`);
      } else {
        res.render("editprofile/view.ejs", {
          uilang: req.params.uilang,
          userDisplayName,
          userROWID,
          loggedIn,
          email,
    
          L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
          pageTitle: L(req.params.uilang, "#sitetitle"),
          pageDescription: L(req.params.uilang, "#sitedescription"),
          pageUrls: {
            "gd": "/gd/atharraich-proifil",
            "en": "/en/edit-profile",
          },
          isHomepage: false,
          
          updateAttempted: true,
          updateFailed,
          displayName,
          bio,
        });
  
      }

      
  
    }
  });
}

