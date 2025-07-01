import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/", function(req, res){
    res.redirect("/gd");
  });

  app.get("/:uilang(gd|en)/", function(req, res){
    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const stats={
      users: 0,
      words: 0,
      hours: 0,
      minutes: "00",
    };
    const tabs={
      mine: 0,
      available: 0,
      owned: 0,
      finished: 0,
      approved: 0,
    };

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      { //get tabs by status:
        const sql=`select status, count(*) as count from sounds group by status`;
        const stmt=db.prepare(sql);
        stmt.all().map(row => { tabs[row["status"]]=row["count"] });
      }
      if(loggedIn) { //get "mine" tabs:
        const sql=`select count(*) as count from sounds where owner=$email`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { tabs.mine=row["count"] });
      }
      { //get "users" stat:
        const sql=`select count(*) as count from users where registrationCompleted=1`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { stats.users=row["count"] });
      }
      { //get "words" stat:
        const sql=`select sum(wordcount) as count from sounds where status='approved'`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { stats.words=row["count"] || 0 });
      }
      { //get "hours" and "minutes" stat:
        let duration=0;
        const sql=`select sum(duration) as duration from sounds where status='approved'`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { duration=row["duration"] || 0 });
        const minutes=Math.floor(duration/60);
        stats.hours=Math.floor(minutes/60);
        stats.minutes=(minutes%60).toString().padStart(2, "0");
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.render("home/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName,
      userROWID,
      loggedIn,
      email,
      isAdmin,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd",
        "en": "/en",
      },
      isHomepage: true,

      tabs,
      stats,
    });
  });
  
}