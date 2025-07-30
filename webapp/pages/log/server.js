import sqlite from "better-sqlite3";
import {wordcounter} from "../../wordcounter.js"; 

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/:uilang(gd|en)/log", function(req, res){
    const email=req.cookies.email;
    let userROWID;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const limit = parseInt(req.query["l"]) || 50; 
    const users={}; //rowid --> name
    const events=[];
    let hasMore = false;

    {
      const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
      try{
        { //check if the user is already logged in:
          let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
          const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
          const stmt=db.prepare(sql);
          stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
        }
        if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
        { //get all users:
          const sql=`select ROWID, displayName from users`;
          const stmt=db.prepare(sql);
          stmt.all().map(row => { users[row["rowid"]]=row["displayName"] });
        }
      } catch(e){
        console.log(e);
      } finally {
        db.close();
      }
    }

    if(!isAdmin){ res.redirect(`/${req.params.uilang}`); return; }
    
    {
      const db=new sqlite("../databases/log.sqlite", {fileMustExist: true});
      try{
        {
          const sql=`select [when], user_rowid, sound_id, event_code, json_payload from log order by [when] desc limit $limit`;
          const stmt=db.prepare(sql);
          stmt.all({limit: limit+1}).map((row, irow) => {
            if(irow<limit){
              events.push({
                when: row["when"],
                user_rowid: row["user_rowid"],
                sound_id: row["sound_id"],
                event_code: row["event_code"],
                json_payload: JSON.stringify(friendlifyPayload(JSON.parse(row["json_payload"])), null, "  "),
              });
            } else {
              hasMore=true;
            }
          });
        }
        if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      } catch(e){
        console.log(e);
      } finally {
        db.close();
      }
    }

    res.render("log/view.ejs", {
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
        "gd": "/gd/log",
        "en": "/en/log",
      },
      isHomepage: false,

      limit,
      users,
      events,
      hasMore,
    });
  });
  
}

function friendlifyPayload(payload){
  let ret = undefined;
  if(typeof(payload)=="object" && payload!=null){
    ret = {};
    for(let key in payload){
      if(key=="transcript"){
        ret["wordcount"] = wordcounter.countWords(payload[key]);
      } else {
        ret[key] = payload[key];
      }
    }
  }
  return ret;
}