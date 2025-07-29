import sqlite from "better-sqlite3";
import {wordcounter} from "../../wordcounter.js"; 
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  app.post("/:uilang(gd|en)/:soundID([0-9]+)", function(req, res){
    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;

    const soundID=parseInt(req.params.soundID);
    const status=req.body.status;
    const transcript=req.body.transcript;
    const duration=parseFloat(req.body.duration);

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      if(loggedIn) { //update the sound as required:
        if(transcript!==undefined){
          {
            const wordcount =  wordcounter.countWords(transcript);
            const sql=`update sounds set transcript=$transcript, wordcount=$wordcount, duration=$duration where id=$soundID`;
            const stmt=db.prepare(sql);
            stmt.run({soundID, transcript, wordcount, duration});
          }
          logEvent(userROWID, soundID, `sound__transcript--save`, {transcript, status});
        }
        if(status=="available") {
          {
            const sql=`update sounds set status=$status, owner=NULL where id=$soundID`;
            const stmt=db.prepare(sql);
            stmt.run({soundID, status});
          }
          if(transcript==undefined) logEvent(userROWID, soundID, `sound__status--set`, {status});
        } else if(status=="owned") {
          {
            const sql=`update sounds set status=$status, owner=$email where id=$soundID`;
            const stmt=db.prepare(sql);
            stmt.run({soundID, email, status});
          }
          if(transcript==undefined) logEvent(userROWID, soundID, `sound__status--set`, {status, owner: userROWID});
        } else if(status=="finished") {
          {
            const sql=`update sounds set status=$status, owner=$email where id=$soundID`;
            const stmt=db.prepare(sql);
            stmt.run({soundID, email, status});
          }
          if(transcript==undefined) logEvent(userROWID, soundID, `sound__status--set`, {status});
        } else if(status=="approved") {
          {
            const sql=`update sounds set status=$status where id=$soundID`;
            const stmt=db.prepare(sql);
            stmt.run({soundID, status});
          }
          if(transcript==undefined) logEvent(userROWID, soundID, `sound__status--set`, {status});
        }
      }
      if(process.env.READONLY==1) loggedIn=false;
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.redirect("/"+req.params.uilang+"/"+soundID);
  });

  app.get("/:uilang(gd|en)/:soundID([0-9]+)", function(req, res){
    const email=req.cookies.email;
    let userROWID=0;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const soundID=parseInt(req.params.soundID);
    let trackID=0;
    let soundTitle=""
    let partNumber=0;
    const partNumbers=[];
    let year="";
    let tapeID=0;
    let tapeTitle="";
    let status="";
    let transcript="";
    let owner="";
    let ownerROWID=0;
    let ownerDisplayName="";
    const speakers=[];
    const fieldworkers=[];
    let duration=0;
    let difficulty="";

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      { //get the sound:
        const sql=`
          select s.difficulty, s.duration, s.id, s.track_id, s.title, s.part_number, s.year, s.tape_id, s.tape_title, s.status, s.owner, u.ROWID as ownerROWID, u.displayName as ownerDisplayName, s.transcript
          from sounds as s
          left outer join users as u on u.email=s.owner
          where id=$soundID`;
        const stmt=db.prepare(sql);
        stmt.all({soundID}).map(row => {
          trackID=row["track_id"];
          soundTitle=row["title"];
          partNumber=row["part_number"];
          year=row["year"];
          tapeID=row["tape_id"];
          tapeTitle=row["tape_title"];
          status=row["status"];
          transcript=row["transcript"] || "";
          owner=row["owner"] || "";
          ownerROWID=row["ownerROWID"] || 0;
          ownerDisplayName=row["ownerDisplayName"] || "";
          duration=row["duration"];
          difficulty=row["difficulty"];
        });
      }
      if(partNumber>0) { //get the other parts, if any:
        const sql=`select id, part_number from sounds where track_id=$trackID order by ROWID`;
        const stmt=db.prepare(sql);
        stmt.all({trackID}).map(row => {
          partNumbers.push({
            id: row["id"],
            partNumber: row["part_number"],
          });
        });
      }
      { //get the sounds's people:
        const sql=`
          select p.person_id, p.name, p.lifetime, p.role
          from people as p
          where track_id=$trackID
          order by p.ROWID`;
        const stmt=db.prepare(sql);
        stmt.all({trackID}).map(row => {
          const person={
            id: row["person_id"],
            name: row["name"],
            lifetime: row["lifetime"],
          };
          if(row["role"]=="speaker") speakers.push(person);
          if(row["role"]=="fieldworker") fieldworkers.push(person);
        });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.render("sound/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName,
      userROWID,
      loggedIn,
      email,
      isAdmin,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd/"+soundID,
        "en": "/en/"+soundID,
      },
      isHomepage: false,

      soundID,
      trackID,
      soundTitle,
      partNumber,
      partNumbers,
      year,
      tapeID,
      tapeTitle,
      status,
      transcript,
      owner,
      ownerROWID,
      ownerDisplayName,
      speakers,
      fieldworkers,
      duration,
      difficulty,
    });
  });
  
}