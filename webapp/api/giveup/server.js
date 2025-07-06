import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/giveup", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;
    let isOwner=false;

    const id = req.query["id"];
    let result=false;

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is logged in and is an admin:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      { //check if the sound is owned and if the person is its owner:
        const sql=`select * from sounds where status='owned' and owner=$email`;
        const stmt=db.prepare(sql);
        stmt.all({email}).map(row => { isOwner=true });
      }
      if(loggedIn && isOwner) {
        { //update the sound:
          const sql=`update sounds set status='available', owner=NULL where id=$id`;
          const stmt=db.prepare(sql);
          stmt.run({id});
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
