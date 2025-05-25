import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/", function(req, res){
    res.redirect("/gd");
  });

  app.get("/:uilang(gd|en)/", function(req, res){
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

    res.render("home/view.ejs", {
      uilang: req.params.uilang,
      loggedIn,
      email,

      L: multistring => L(req.params.uilang, multistring),
      pageTitle: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageDescription: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageUrls: {
        "gd": "/gd",
        "en": "/en",
      },
      isHomepage: true,
    });
  });
  
}