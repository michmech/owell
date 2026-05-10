import sqlite from "better-sqlite3";

export default function(app, L, do404, doReadOnly, rootdir){
  app.get("/dump", function(req, res){
    const sounds=[];
    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      const sql=`
        select id, title, difficulty, transcript
        from sounds as s
        where s.status='approved'
        order by s.ROWID desc;
      `;
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          const transcript = row["transcript"]
            //remove timestamps (and clean whitespace left by them):
            .replace(/( *)\(([0-9]+):([0-9]+)\)( *)/g, ($0, $1, $2, $3) => {
              if($1!="" || $3!="") return " ";
              return "";
            }) 
          ;
          const sound = {
            id: row["id"],
            difficulty: row["difficulty"],
            soundfile: process.env.URLSTART+"/getsoundfile?id="+row["id"],
            title: row["title"],
            transcript,
          };
          sounds.push(sound);
        });
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    res.json(sounds);
  });
}
