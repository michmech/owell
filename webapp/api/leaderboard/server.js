import sqlite from "better-sqlite3";

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/leaderboard", async function(req, res){
    const profiles=[];

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{

      { //load the profiles:
        const sql=`
          select u.rowid, u.email, u.displayName, u.isAdmin
          , sum(s.wordcount) filter(where s.difficulty='low') as wordcountLow
          , sum(s.wordcount) filter(where s.difficulty='medium') as wordcountMedium
          , sum(s.wordcount) filter(where s.difficulty='high') as wordcountHigh
          , sum(case 
              when s.difficulty='low' then s.wordcount
              when s.difficulty='medium' then s.wordcount*2
              when s.difficulty='high' then s.wordcount*3
            end) as score
          from users as u
          left outer join sounds as s on s.owner=u.email and s.status='approved'
          group by u.rowid
          order by score desc, u.rowid asc
          limit 25
        `;
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          profiles.push({
            rowid: row.rowid,
            email: row.email,
            displayName: row.displayName,
            isAdmin: (row["isAdmin"]==1),
            wordcountLow: row.wordcountLow || 0,
            wordcountMedium: row.wordcountMedium || 0,
            wordcountHigh: row.wordcountHigh || 0,
          });
        });
      }

    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.json(profiles);
  });
  
}