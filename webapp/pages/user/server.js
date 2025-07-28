import sqlite from "better-sqlite3";
import * as linkify from "linkifyjs";
import linkifyStr from "linkify-string";

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/:uilang(gd|en)/u:rowid([0-9]+)", function(req, res){
    const email=req.cookies.email;
    let userROWID;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const profile={
      rowid: req.params.rowid,
      email: "",
      displayName: "",
      registeredWhen: "",
      bioMarkdown: "",
      bioHtml: "",
    };
    const stats={
      low: 0,
      medium: 0,
      high: 0,
    };

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      { //load the profile:
        const sql=`select email, displayName, bio, registeredWhen from users where rowid=$rowid and registrationCompleted=1`;
        const stmt=db.prepare(sql);
        stmt.all({rowid: profile.rowid}).map(row => {
          profile.email=row["email"];
          profile.displayName=row["displayName"];
          profile.registeredWhen=row["registeredWhen"].substring(0, 10);
          profile.bioMarkdown=row["bio"];
          profile.bioHtml=doMarkdown(profile.bioMarkdown);
        });
      }
      if(profile.email) { //load wordcounts:
        const sql=`
          select difficulty, sum(wordcount) as wordcount
          from sounds
          where owner=$email and status='approved'
          group by difficulty
        `;
        const stmt=db.prepare(sql);
        stmt.all({email: profile.email}).map(row => {
          stats[row.difficulty]=row.wordcount;
        });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    

    if(!profile.email){
      do404(req, res);
    } else {
      res.render("user/view.ejs", {
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
          "gd": "/gd/u"+profile.rowid,
          "en": "/en/u"+profile.rowid,
        },
        isHomepage: false,
  
        profile,
        stats,
      });
    }
  });
  
}

function doMarkdown(txt){
  // txt = txt.replace(/</g, "&lt;");
  const options = { target: "_blank" };
  const html = linkifyStr(txt, options);
  return html;
}
