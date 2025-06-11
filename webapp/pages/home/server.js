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

    const tracks=[];
    const myTracks=[];

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1) });
      }
      { //get list of tracks:
        const sql=`
          select t.id, t.title, t.status, t.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName
          from tracks as t
          left outer join users as u on u.email=t.owner
          order by t.id`
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          const track={
            id: row["id"],
            title: row["title"],
            status: row["status"],
            owner: row["owner"],
            ownerROWID: row["ownerROWID"],
            ownerDisplayName: row["ownerDisplayName"],
          };
          if( (track.status=="owned" && track.owner==email) || (track.status=="finished" && isAdmin)){
            myTracks.push(track);
          } else {
            tracks.push(track);
          }
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
      tracks,
      myTracks,
    });
  });
  
}