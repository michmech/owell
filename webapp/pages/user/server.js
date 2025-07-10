import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/:uilang(gd|en)/u:rowid([0-9]+)", function(req, res){
    const email=req.cookies.email;
    let userROWID;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const rowid=req.params.rowid;

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

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
        "gd": "/gd/u"+rowid,
        "en": "/en/u"+rowid,
      },
      isHomepage: false,

    });
  });
  
}