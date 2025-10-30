import sqlite from "better-sqlite3";

const removeAccents = str =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/:uilang(gd|en)/u", function(req, res){
    const email=req.cookies.email;
    let userROWID;
    let userDisplayName="";
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    let isAdmin=false;

    const topProfiles=[];
    const topProfileIDs=[];
    const remainingProfiles=[];

    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
      }
      if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
      { //load the top profiles:
        const sql=`
          select u.rowid, u.email, u.displayName
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
          where u.registrationCompleted=1
          group by u.rowid
          having score > 0
          order by score desc, u.rowid asc
          limit 10
        `;
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          topProfileIDs.push(row.rowid)
          topProfiles.push({
            rowid: row.rowid,
            email: row.email,
            displayName: row.displayName,
            wordcountLow: row.wordcountLow || 0,
            wordcountMedium: row.wordcountMedium || 0,
            wordcountHigh: row.wordcountHigh || 0,
          });
        });
      }
      { //load remaining profiles:
        const sql=`
          select u.rowid, u.email, u.displayName
          from users as u
          where u.registrationCompleted=1
        `;
        const stmt=db.prepare(sql);
        stmt.all().map(row => {
          if(topProfileIDs.indexOf(row.rowid) == -1){
            remainingProfiles.push({
              rowid: row.rowid,
              email: row.email,
              displayName: row.displayName,
            });
          }
        });
        remainingProfiles.sort((a,b) => {
          const aSortkey = removeAccents(a.displayName);
          const bSortkey = removeAccents(b.displayName);
          if(aSortkey == "" || aSortkey>bSortkey) return +1;
          if(bSortkey == "" || bSortkey>aSortkey) return -1;
          return 0;
        });
      }
      
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    

    res.render("users/view.ejs", {
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
        "gd": "/gd/u",
        "en": "/en/u",
      },
      isHomepage: false,

      topProfiles,
      remainingProfiles,
    });
  });
  
}