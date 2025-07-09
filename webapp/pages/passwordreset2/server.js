import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  //the new-password form before submission:
  app.get("/:uilang(gd|en)/(facal-faire-air-diochuimhne2|forgot-password2)", function(req, res){
    const email = req.query["e"];
    const key = req.query["k"];
    let exists = false;
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      //verify this email-and-key combo exists:
      const sql=`select email from users where lower(email)=lower($email) and registrationKey=$key`;
      const stmt=db.prepare(sql);
      stmt.all({email, key}).forEach(row => { exists=true; });
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(!exists){
      res.redirect(`/${req.params.uilang}`);
    } else {
      res.render("passwordreset2/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName: "",
        userROWID: 0,
        loggedIn: false,
        email: email,
        key: key,
  
        L: multistring => L(req.params.uilang, multistring),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/facal-faire-air-diochuimhne",
          "en": "/en/forgot-password",
        },
        isHomepage: false,

        formSubmitted: false,
        changeFailed: false,
        password: "",
      });
    }

  });

  //the new-password form after submission:
  app.post("/:uilang(gd|en)/(facal-faire-air-diochuimhne2|forgot-password2)", function(req, res){
    let loggedIn = false;
    const sessionKey=req.cookies.sessionkey;
    let userROWID=0;
    let userDisplayName="";

    const email = req.body.email;
    const key = req.body.key;
    const password = req.body.password;
    const passwordHash = app.hash(password);

    let changeFailed = false; 

    if(password.trim()==""){
      changeFailed = "#passwordmustnotbeblank";
    }

    if(!changeFailed){
      const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
      try{
        const sql=`update users set passwordHash=$passwordHash, sessionKey=NULL, registrationKey=NULL where lower(email)=lower($email) and registrationKey=$key`;
        const stmt=db.prepare(sql);
        stmt.run({email, passwordHash, key});
      } catch(e){
        console.log(e);
      } finally {
        db.close();
      }
    }

    res.render("passwordreset2/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName: "",
      userROWID: 0,
      loggedIn: false,
      email: email,
      key: key,

      L: multistring => L(req.params.uilang, multistring),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd/facal-faire-air-diochuimhne",
        "en": "/en/forgot-password",
      },
      isHomepage: false,

      formSubmitted: true,
      changeFailed,
      password: password,
    });
  });

}

