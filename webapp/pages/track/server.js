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
          const sql=`update tracks set transcript=$transcript, status=$status where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, transcript, status});
        } else if(status=="available") {
          const sql=`update tracks set status=$status, owner=NULL where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, status});
        } else if(status=="owned") {
          const sql=`update tracks set status=$status, owner=$email where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, email, status});
        } else if(status=="finished") {
          const sql=`update tracks set status=$status, owner=$email where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, email, status});
        } else if(status=="approved") {
          const sql=`update tracks set status=$status where id=$trackID`;
          const stmt=db.prepare(sql);
          stmt.run({trackID, status});
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
    let isAdmin=false;

    const trackID=parseInt(req.params.trackID);
    let trackTitle=""
    let status="";
    let transcript="";
    let owner="";
    let ownerROWID=0;
    let ownerDisplayName="";

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      { //get the track:
        const sql=`
          select t.id, t.title, t.status, t.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName, t.transcript
          from tracks as t
          left outer join users as u on u.email=t.owner
          where id=$trackID`;
        const stmt=db.prepare(sql);
        stmt.all({trackID}).map(row => {
          trackTitle=row["title"];
          status=row["status"];
          transcript=row["transcript"] || "";
          owner=row["owner"] || "";
          ownerROWID=row["ownerROWID"] || 0;
          ownerDisplayName=row["ownerDisplayName"] || "";
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
      isAdmin,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
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
      ownerROWID,
      ownerDisplayName,
    });
  });
  
}