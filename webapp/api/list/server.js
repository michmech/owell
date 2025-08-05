import sqlite from "better-sqlite3";

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/list", async function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const queryName = req.query["queryName"];
    const rowid = req.query["rowid"] || 0;
    const sounds=[];

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is logged in and is an admin:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }

      { //get list of sounds:
        let sql="";
        if(queryName=="theirs") sql=`
          select length(s.pretranscript) as pretranscript_length, s.difficulty, s.id, s.track_id, s.title, s.year, s.part_number, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          where u.rowid=$rowid
          order by s.ROWID desc`;
        if(queryName=="mine") sql=`
          select length(s.pretranscript) as pretranscript_length, s.difficulty, s.id, s.track_id, s.title, s.year, s.part_number, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          where s.owner=$email
          order by s.ROWID desc`;
        else if(queryName=="available") sql=`
          select length(s.pretranscript) as pretranscript_length, s.difficulty, s.id, s.track_id, s.title, s.year, s.part_number, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          where s.status='available'
          order by s.ROWID asc`;
        else if(queryName=="owned") sql=`
          select length(s.pretranscript) as pretranscript_length, s.difficulty, s.id, s.track_id, s.title, s.year, s.part_number, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          where s.status='owned'
          order by s.ROWID desc`;
        else if(queryName=="finished") sql=`
          select length(s.pretranscript) as pretranscript_length, s.difficulty, s.id, s.track_id, s.title, s.year, s.part_number, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          where s.status='finished'
          order by s.ROWID desc`;
        else if(queryName=="approved") sql=`
          select length(s.pretranscript) as pretranscript_length, s.difficulty, s.id, s.track_id, s.title, s.year, s.part_number, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          where s.status='approved'
          order by s.ROWID desc`;
        const stmt=db.prepare(sql);
        stmt.all({email, rowid}).map(row => {
          const sound={
            id: row["id"],
            trackID: row["track_id"],
            title: row["title"],
            year: row["year"],
            partNumber: row["part_number"],
            status: row["status"],
            owner: row["owner"],
            ownerROWID: row["ownerROWID"],
            ownerDisplayName: row["ownerDisplayName"],
            speakers: [],
            fieldworkers: [],
            prominent: (row["owner"]!=null && row["owner"]==email),
            difficulty: row["difficulty"],
            hasASR: row["pretranscript_length"]>0,
          };
          sounds.push(sound);
        });
      }

      { //add people to sounds:
        const sql=`
          select p.track_id, p.person_id, p.name, p.lifetime, p.role
          from people as p
          order by p.ROWID`;
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          const person={
            id: row["person_id"],
            name: row["name"],
            lifetime: row["lifetime"],
          };
          const trackID=row["track_id"];
          sounds.forEach(s => {
            if(s.trackID==trackID){
              if(row["role"]=="speaker") s.speakers.push(person);
              if(row["role"]=="fieldworker") s.fieldworkers.push(person);
            }
          });
        });
      }

    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.json({isAdmin, sounds});
  });
  
}