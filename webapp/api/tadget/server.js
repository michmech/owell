import sqlite from "better-sqlite3";
import getter from "./getter.js";
import {logEvent} from '../../logger.js';

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/tadget", async function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;
    let userROWID = 0;

    const trackID = req.query["id"];
    let error = null;

    let db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is logged in and is an admin:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select rowid, email, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { userROWID=row["rowid"]; loggedIn=true; isAdmin=(row["isAdmin"]==1) });
        if(!loggedIn || !isAdmin) error="#errorhasoccurred";
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      if(!error) { //check that we don't already have this track:
        const sql=`select * from sounds as s where s.track_id=$trackID`
        const stmt=db.prepare(sql);
        stmt.all({trackID}).map(row => { error="#trackalreadyexists"; });
      }
    } catch(e){
      console.log(e);
      error="#errorhasoccurred";
    } finally {
      db.close();
    }

    let it=null;

    
    if(!error){
      const ret=await getter(trackID);
      if(ret.error){
        error = "#errortalkingtotadapi";
      } else if(!ret.it.title || ret.it.sounds.length==0){
        error = "#nosuchtrack";
      } else {
        it = ret.it;
      }
    }

    const sounds=[];

    db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    if(!error) try{
      { //insert the sounds:
        const sql=`
          insert into sounds(id, track_id, title, year, part_number, url, status, tape_id, tape_title)
          values($id, $track_id, $title, $year, $part_number, $url, 'available', $tape_id, $tape_title)`;
        const stmt=db.prepare(sql);
        it.sounds.forEach( (sound, i) => {
          stmt.run({
            "id": sound.id,
            "track_id": trackID,
            "title": it.title,
            "year": it.year,
            "part_number": (it.sounds.length>1 ? (i+1) : 0),
            "url": sound.url,
            "tape_id": it.tape.id,
            "tape_title": it.tape.title,
          });
          logEvent(userROWID, parseInt(sound.id), `sound--create`, {trackID, title: it.title});
          sounds.push({
            id: sound.id,
            trackID: trackID,
            title: it.title,
            year: it.year,
            partNumber: (it.sounds.length>1 ? (i+1) : 0),
            status: "available",
            owner: null,
            ownerROWID: null,
            ownerDisplayName: null,
            speakers: [],
            fieldworkers: [],
            difficulty: "medium",
          });
        });
      }
      { //insert the people:
        const sql=`
          insert into people(track_id, person_id, role, name, lifetime)
          values($track_id, $person_id, $role, $name, $lifetime)`;
        const stmt=db.prepare(sql);
        [it.speakers, it.fieldworkers].map((arr, i) => {
          arr.forEach(person => {
            stmt.run({
              "track_id": trackID,
              "person_id": person.id,
              "role": ["speaker", "fieldworker"][i],
              "name": person.name,
              "lifetime": person.lifetime,
            });
            sounds.forEach(sound => {
              sound[["speakers", "fieldworkers"][i]].push({
                id: person.id,
                name: person.name,
                lifetime: person.lifetime,
              });
            });
          });
        });
      }
    } catch(e){
      console.log(e);
      error="#errorhasoccurred"
    } finally {
      db.close();
    }

    res.json({error, sounds});
  });
  
}