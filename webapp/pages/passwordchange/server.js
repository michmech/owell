import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  //the password change form, before submission:
  app.get("/:uilang(gd|en)/(atharraich-facal-faire|change-password)", function(req, res){
    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(!loggedIn){
      res.redirect(`/${req.params.uilang}/`);
    } else {
      res.render("passwordchange/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName,
        userROWID,
        loggedIn,
        email,
  
        L: multistring => L(req.params.uilang, multistring),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/atharraich-facal-faire",
          "en": "/en/change-password",
        },
        isHomepage: false,
  
        formSubmitted: false,
        changeFailed: false,
        password: "",
      });
    }

  });

  //the password change, after submission:
  app.post("/:uilang(gd|en)/(atharraich-facal-faire|change-password)", function(req, res){
    let loggedIn = false;
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let userROWID=0;
    let userDisplayName="";
    const password = req.body.password;
    const passwordHash = app.hash(password);

    const now=(new Date()).toISOString();
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    let changeFailed = false; 
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      if(loggedIn){
        if(password.trim()==""){
          changeFailed = "#passwordmustnotbeblank";
        }
      }
      if(loggedIn && !changeFailed){
        const sql=`update users set passwordHash=$passwordHash where email=$email`;
        const stmt=db.prepare(sql);
        stmt.run({email, passwordHash});
    }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    
    res.render("passwordchange/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName: userDisplayName,
      userROWID: userROWID,
      loggedIn,
      email,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd/atharraich-facal-faire",
        "en": "/en/change-password",
    },
      isHomepage: false,
      
      formSubmitted: true,
      changeFailed,
      password,
    });

  });
}
