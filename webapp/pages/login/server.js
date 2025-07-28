import sqlite from "better-sqlite3";

export default function(app, L, do404, doReadOnly, rootdir){

  //the login form, before submission:
  app.get("/:uilang(gd|en)/(a-steach|login)", function(req, res){
    if(process.env.READONLY==1){ doReadOnly(req, res); return; }

    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;
    
    const redirTo=req.query.to || `/${req.params.uilang}`;
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(loggedIn){
      res.redirect(`/${req.params.uilang}/`);
    } else {
      res.render("login/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName,
        userROWID,
        loggedIn,
        email,
  
        L: multistring => L(req.params.uilang, multistring),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/a-steach",
          "en": "/en/login",
        },
        isHomepage: false,
  
        loginFailed: false,
        redirTo,
        password: "",
      });
    }

  });

  //the login form, after submission:
  app.post("/:uilang(gd|en)/(a-steach|login)", function(req, res){
    if(process.env.READONLY==1){ doReadOnly(req, res); return; }

    let loggedIn = false;
    const email = req.body.email;
    let userROWID=0;
    let userDisplayName="";
    const password = req.body.password;
    const passwordHash = app.hash(password);

    const sessionKey=generateKey();
    const now=(new Date()).toISOString();
    const redirTo=req.body.redirTo || `/${req.params.uilang}`;
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    let loginFailed = true; 
    try{
      { //check if email and password match:
        const sql=`select email from users where lower(email)=lower($email) and passwordHash=$passwordHash and registrationCompleted=1`;
        const stmt=db.prepare(sql);
        stmt.all({email, passwordHash}).map(row => { loginFailed = false; loggedIn=true; });
      }
      if(!loginFailed){ //if they do, tell the DB the user is logged in:
        const sql=`update users set sessionKey=$sessionKey, lastSeen=$now where lower(email)=lower($email)`;
        const stmt=db.prepare(sql);
        stmt.run({email, sessionKey, now});
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    
    if(!loginFailed){ //if login successful, set cookie and redirect:
      const oneday=86400000; //86,400,000 miliseconds = 24 hours
      res.cookie("email", email, {expires: new Date(Date.now() + oneday)});
      res.cookie("sessionkey", sessionKey, {expires: new Date(Date.now() + oneday)});
      res.redirect(redirTo);
    } else { //if login failed, display the login form again: 
      res.render("login/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName: "",
        userROWID: 0,
        loggedIn,
        email,

        L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/a-steach",
          "en": "/en/login",
        },
        isHomepage: false,
        
        loginFailed,
        redirTo,
        password,
      });
    }
  });
}

function generateKey(){
  var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key="";
  while(key.length<32) {
    var i=Math.floor(Math.random() * alphabet.length);
    key+=alphabet[i]
  }
  return key;
}