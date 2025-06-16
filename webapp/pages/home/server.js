import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/", function(req, res){
    res.redirect("/gd");
  });

  app.get("/:uilang(gd|en)/", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const sounds=[];
    const mySounds=[];

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      { //get list of sounds:
        const sql=`
          select s.id, s.track_id, s.title, s.year, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from sounds as s
          left outer join users as u on u.email=s.owner
          order by s.ROWID`
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          const sound={
            id: row["id"],
            trackID: row["track_id"],
            title: row["title"],
            year: row["year"],
            status: row["status"],
            owner: row["owner"],
            ownerROWID: row["ownerROWID"],
            ownerDisplayName: row["ownerDisplayName"],
            speakers: [],
            fieldworkers: [],
          };
          if( (sound.status=="owned" && sound.owner==email) || (sound.status=="finished" && isAdmin)){
            mySounds.push(sound);
          } else {
            sounds.push(sound);
          }
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
          [sounds, mySounds].forEach(arr => {
            arr.forEach(s => {
              if(s.trackID==trackID){
                if(row["role"]=="speaker") s.speakers.push(person);
                if(row["role"]=="fieldworker") s.fieldworkers.push(person);
              }
            });
          });
        });
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
      isAdmin,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd",
        "en": "/en",
      },
      isHomepage: true,
      sounds,
      mySounds,
    });
  });
  
}