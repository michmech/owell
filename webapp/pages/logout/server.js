import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/:uilang(gd|en)/(a-amach|logout)", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;

    const redirTo=req.query.to || `/${req.params.uilang}`;
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      {
        const sql=`update users set sessionKey=NULL where lower(email)=lower($email)`;
        const stmt=db.prepare(sql);
        stmt.run({email, sessionKey});
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.clearCookie("email");
    res.clearCookie("sessionkey");
    res.redirect(redirTo);
  });

}
