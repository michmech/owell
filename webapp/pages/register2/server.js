import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/:uilang(gd|en)/(claraich2|register2)", function(req, res){
    const email = req.query["e"];
    const key = req.query["k"];
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        const sql=`update users set registrationCompleted=1 where email=$email and registrationKey=$key`;
        const stmt=db.prepare(sql);
        stmt.run({email, key});
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.render("register2/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName: "",
      userROWID: 0,
      loggedIn: false,
      email: "",

      L: multistring => L(req.params.uilang, multistring),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd/claraich",
        "en": "/en/register",
      },
      isHomepage: false,
    });
  });

}

