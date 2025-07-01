// import fs from "fs/promises";

export default async function(archival_object_id){
  let error = null;

  //log in:
  let session = "";
  try {
    const resp = await fetch(
      `https://tobarapi.is.ed.ac.uk/users/${process.env.TADAPIUSR}/login?password=${process.env.TADAPIPWD}`,
      {method: "POST"}  
    );
    if(resp.ok){
      const json = await resp.json();
      session = json.session;
    }
  } catch(e){
    error = e;
    console.log(error);
  }

  //get the track ("archival object"): 
  const it={
    id: archival_object_id,
    title: "",
    year: "",
    speakers: [],
    fieldworkers: [],
    sounds : [],
    tape : "",
  };
  if(!error && session) try {
    const resp = await fetch(
      `https://tobarapi.is.ed.ac.uk/repositories/2/archival_objects/${archival_object_id}`,
      {method: "GET", headers: {"X-ArchivesSpace-Session": session}}  
    );
    if(resp.ok){
      const json = await resp.json();
      // fs.writeFile("./test.json", JSON.stringify(json, null, "  "));
      it.title = json.title;
      if(json.dates && json.dates[0] && json.dates[0].begin && json.dates[0].begin.length>=4){
        it.year = json.dates[0].begin.substring(0, 4);
      }
      (json.linked_agents || []).forEach(el => {
        if(el.ref && el.relator && el.relator=="ctb") it.speakers.push(el.ref);
        if(el.ref && el.relator && el.relator=="Fieldworker") it.fieldworkers.push(el.ref);
      });
      (json.instances || []).forEach(el => {
        if(el.digital_object && el.digital_object.ref) it.sounds.push(el.digital_object.ref);
      });
      (json.ancestors || []).forEach(el => {
        if(el.level && el.level=="series" && el.ref && !it.tape) it.tape=el.ref;
      });
    }
  } catch(e){
    error = e;
    console.log(error);
  }

  //get the speakers:
  if(!error) for(let i=0; i<it.speakers.length; i++){
    try {
      const resp = await fetch(
        `https://tobarapi.is.ed.ac.uk${it.speakers[i]}`,
        {method: "GET", headers: {"X-ArchivesSpace-Session": session}}  
      );
      if(resp.ok){
        const json = await resp.json();
        // fs.writeFile("./test.json", JSON.stringify(json, null, "  "));
        const speaker = {};
        speaker.id = it.speakers[i].split("/")[3];
        if(json.display_name){
          speaker.name = ((json.display_name.rest_of_name||"")+" "+(json.display_name.primary_name||"")).trim();
          speaker.lifetime = json.display_name.dates || "";
        }
        if(speaker.name) it.speakers[i] = speaker;
      }
    } catch(e){
      error = e;
      console.log(error);
    }
  }
  it.speakers = it.speakers.filter(x => typeof(x)=="object");

  //get the fieldworkers:
  if(!error) for(let i=0; i<it.fieldworkers.length; i++){
    try {
      const resp = await fetch(
        `https://tobarapi.is.ed.ac.uk${it.fieldworkers[i]}`,
        {method: "GET", headers: {"X-ArchivesSpace-Session": session}}  
      );
      if(resp.ok){
        const json = await resp.json();
        // fs.writeFile("./test.json", JSON.stringify(json, null, "  "));
        const fieldworker = {};
        fieldworker.id = it.fieldworkers[i].split("/")[3];
        if(json.display_name){
          fieldworker.name = ((json.display_name.rest_of_name||"")+" "+(json.display_name.primary_name||"")).trim();
          fieldworker.lifetime = json.display_name.dates || "";
        }
        if(fieldworker.name) it.fieldworkers[i] = fieldworker;
      }
    } catch(e){
      error = e;
      console.log(error);
    }
  }
  it.fieldworkers = it.fieldworkers.filter(x => typeof(x)=="object");

  //get the sounds ("digital objects"):
  if(!error) for(let i=0; i<it.sounds.length; i++){
    try {
      const resp = await fetch(
        `https://tobarapi.is.ed.ac.uk${it.sounds[i]}`,
        {method: "GET", headers: {"X-ArchivesSpace-Session": session}}  
      );
      if(resp.ok){
        const json = await resp.json();
        // fs.writeFile("./test.json", JSON.stringify(json, null, "  "));
        const sound = {};
        sound.id = it.sounds[i].split("/")[4];
        if(json.file_versions && json.file_versions.length>0 && json.file_versions[0].file_uri){
          sound.url = json.file_versions[0].file_uri;
        }
        if(sound.url) it.sounds[i] = sound;
      }
    } catch(e){
      error = e;
      console.log(error);
    }
  }
  it.sounds = it.sounds.filter(x => typeof(x)=="object");

  //get the SSSA tapes:
  if(!error){
    try {
      const resp = await fetch(
        `https://tobarapi.is.ed.ac.uk${it.tape}`,
        {method: "GET", headers: {"X-ArchivesSpace-Session": session}}  
      );
      if(resp.ok){
        const json = await resp.json();
        // fs.writeFile("./test.json", JSON.stringify(json, null, "  "));
        const tape = {};
        tape.id = it.tape.split("/")[4];
        tape.title = json.title || ""; 
        if(tape.title) it.tape = tape;
      }
    } catch(e){
      error = e;
      console.log(error);
    }
  }
  if(typeof(it.tape)!="object") it.tape={id: "", title: ""};

  return {error, it};  
}