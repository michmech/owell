import sqlite from "better-sqlite3";

export function logEvent(user_rowid, sound_id, event_code, json_payload){
  // console.log("LOGGED EVENT:", user_rowid, sound_id, eventCode, jsonPayload);

  const db=new sqlite("../databases/log.sqlite", {fileMustExist: true});
  try{
    const sql=`
      insert into log([when], user_rowid, sound_id, event_code, json_payload)
      values(datetime(), $user_rowid, $sound_id, $event_code, $json_payload)  
    `;
    const stmt=db.prepare(sql);
    stmt.run({user_rowid, sound_id, event_code, json_payload});
  } catch(e){
    console.log(e);
  } finally {
    db.close();
  }

}