import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/difficulty", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const id = req.query["id"];
    const difficulty = req.query["difficulty"];
    let result=false;

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is logged in and is an admin:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      if(loggedIn && isAdmin) {
        { //update the sound:
          const sql=`update sounds set difficulty=$difficulty where id=$id`
          const stmt=db.prepare(sql);
          stmt.run({difficulty, id});
        }
        result=true;
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.json(result);
  });
  
}
