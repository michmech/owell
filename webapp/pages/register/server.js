import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  //the registration form, before submission:
  app.get("/:uilang(gd|en)/(claraich|register)", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(loggedIn){
      res.redirect(`/${req.params.uilang}`);
    } else {
      res.render("register/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName: "",
        userROWID: 0,
        loggedIn,
        email,
  
        L: multistring => L(req.params.uilang, multistring),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/claraich",
          "en": "/en/register",
        },
        isHomepage: false,
  
        registrationAttempted: false,
        registrationFailed: false,
        displayName: "",
        password: "",
      });
    }

  });

  //the registration form, after submission:
  app.post("/:uilang(gd|en)/(claraich|register)", function(req, res){
    let loggedIn = false;
    const email = req.body.email;
    let userROWID=0;
    let userDisplayName="";
    const password = req.body.password;
    const displayName = req.body.displayName;
    const passwordHash = app.hash(password);

    let registrationFailed = false; 

    if(!registrationFailed && displayName.trim()==""){
      registrationFailed = "#displaynamemustnotbeblank";
    }
    
    if(!registrationFailed && email.trim()==""){
      registrationFailed = "#emailmustnotbeblank";
    }
    
    if(!registrationFailed && password.trim()==""){
      registrationFailed = "#passwordmustnotbeblank";
    }
    
    if(!registrationFailed){
      const registrationKey=generateKey();
      const now=(new Date()).toISOString();
      const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
      try{
        { //check if this email is already taken:
          const sql=`select email from users where lower(email)=lower($email)`;
          const stmt=db.prepare(sql);
          stmt.all({email}).map(row => { registrationFailed = "#emailalreadytaken"; });
        }
        if(!registrationFailed){ //if not, do register this person:
          {
            const sql=`
              delete from users where email=$email and registrationCompleted=0
            `;
            const stmt=db.prepare(sql);
            stmt.run({email});
          }
          {
            const sql=`
              insert into users(email, passwordHash, displayName, lastSeen, registrationCompleted, registrationKey)
              values($email, $passwordHash, $displayName, $now, 0, $registrationKey)  
            `;
            const stmt=db.prepare(sql);
            stmt.run({email, passwordHash, displayName, now, registrationKey});
          }
          
          //tbd: send email
          let url=process.env.URLSTART;
          url+=`/${req.params.uilang}/${L(req.params.uilang, "claraich2|register2")}?e=${email}&k=${registrationKey}`;
          console.log(url);

        }
      } catch(e){
        console.log(e);
      } finally {
        db.close();
      }
    }
    
    res.render("register/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName: "",
      userROWID: 0,
      loggedIn,
      email,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd/claraich",
        "en": "/en/register",
      },
      isHomepage: false,
      
      registrationAttempted: true,
      registrationFailed,
      displayName,
      password,
    });
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