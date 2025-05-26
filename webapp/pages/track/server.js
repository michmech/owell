import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.post("/:uilang(gd|en)/:trackID([0-9]+)", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;

    const trackID=parseInt(req.params.trackID);
    const status=req.body.status;
    const transcript=req.body.transcript;

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; });
      }
      if(loggedIn) { //update the track as required:
        if(transcript){
          const sql=`update tracks set transcript=$transcript, status=$status, owner=$email where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, email, transcript, status});
        } else {
          const sql=`update tracks set status=$status, owner=$email where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, email, status});
        }
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.redirect("/"+req.params.uilang+"/"+trackID);
  });

  app.get("/:uilang(gd|en)/:trackID([0-9]+)", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;

    const trackID=parseInt(req.params.trackID);
    let trackTitle=""
    let status="";
    let transcript="";
    let owner="";

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; });
      }
      { //get the track:
        const sql=`select id, title, status, owner, transcript from tracks where id=$trackID`;
        const stmt=db.prepare(sql);
        stmt.all({trackID}).map(row => {
          trackTitle=row["title"];
          status=row["status"];
          transcript=row["transcript"] || "";
          owner=row["owner"] || "";
        });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.render("track/view.ejs", {
      uilang: req.params.uilang,
      loggedIn,
      email,

      L: multistring => L(req.params.uilang, multistring),
      pageTitle: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageDescription: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageUrls: {
        "gd": "/gd/"+trackID,
        "en": "/en/"+trackID,
      },
      isHomepage: false,

      trackID,
      trackTitle,
      status,
      transcript,
      owner,
    });
  });
  
}