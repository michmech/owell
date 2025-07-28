import sqlite from "better-sqlite3";

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/delete", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

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
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      if(loggedIn && isAdmin) {
        { //delete the sound:
          const sql=`delete from sounds where id=$id`
          const stmt=db.prepare(sql);
          stmt.run({id});
        }
        { //delete any dangling people:
          const sql=`
            delete from people where ROWID in (
              select p.ROWID
              from people as p
              left outer join sounds as s on s.track_id=p.track_id
              where s.id is null
            )`
          const stmt=db.prepare(sql);
          stmt.run();
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
