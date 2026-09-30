import sqlite from "better-sqlite3";

export default function(app, L, do404, doReadOnly, rootdir){
  app.get("/stats", function(req, res){

    const stats={
      words: 0,
      hours: 0,
      minutes: "00",
    };

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //get "words" stat:
        const sql=`select sum(wordcount) as count from sounds where status='approved'`;
        const stmt=db.prepare(sql);
        stmt.all().map(row => { stats.words=row["count"] || 0 });
      }
      { //get "hours" and "minutes" stat:
        let duration=0;
        const sql=`select sum(duration) as duration from sounds where status='approved'`;
        const stmt=db.prepare(sql);
        stmt.all().map(row => { duration=row["duration"] || 0 });
        const minutes=Math.floor(duration/60);
        stats.hours=Math.floor(minutes/60);
        stats.minutes=(minutes%60).toString().padStart(2, "0");
      }

    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    res.json(stats);
  });
}
