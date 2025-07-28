import sqlite from "better-sqlite3";
import fs from "fs";
import markdown from "markdown-it";
import attrs from "markdown-it-attrs";

export default function(app, L, do404, doReadOnly, rootdir){

  app.get("/:uilang(gd|en)/(mu-ar-deidhinn|about-us)", function(req, res){
    go(req, res, L, "about.md", L(req.params.uilang, "#aboutus"), {gd: "/gd/mu-ar-deidhinn", en: "/en/about-us"})
  });
  
  app.get("/:uilang(gd|en)/(priobhaideachd|privacy)", function(req, res){
    go(req, res, L, "privacy.md", L(req.params.uilang, "#privacy"), {gd: "/gd/priobhaideachd", en: "/en/privacy"})
  });

  app.get("/:uilang(gd|en)/(so-ruigsinneachd|accessibility)", function(req, res){
    go(req, res, L, "accessibility.md", L(req.params.uilang, "#accessibility"), {gd: "/gd/so-ruigsinneachd", en: "/en/accessibility"})
  });
  
  app.get("/:uilang(gd|en)/(treoir|guide)", function(req, res){
    go(req, res, L, "guide.md", L(req.params.uilang, "#guidefortranscribers"), {gd: "/gd/treoir", en: "/en/guide"}, "circle-info")
  });
  
}

function go(req, res, L, markdownFileName, pageTitle, pageUrls, icon){
  const email=req.cookies.email;
  let userROWID;
  let userDisplayName="";
  const sessionKey=req.cookies.sessionkey;
  let loggedIn=false;
  let isAdmin=false;

  const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
  try{
    { //check if the user is already logged in:
      let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
      const sql=`select ROWID, email, displayName, isAdmin from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
      const stmt=db.prepare(sql);
      stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; isAdmin=(row["isAdmin"]==1); userDisplayName=row["displayName"]; userROWID=row["rowid"];  });
    }
    if(process.env.READONLY==1){ loggedIn=false; isAdmin=false; }
  } catch(e){
    console.log(e);
  } finally {
    db.close();
  }

  fs.readFile(`./info/${req.params.uilang}/${markdownFileName}`, "utf8", function(err, txt){
    if(err) console.log(err);
    let html = doMarkdown(txt);

    res.render("info/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName,
      userROWID,
      loggedIn,
      email,
      isAdmin,
  
      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: pageTitle,
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: pageUrls,
      isHomepage: false,
  
      icon: icon,
      html: html,
    });
  });
 }

function doMarkdown(txt){
  var md=new markdown({html: true});
  md.use(attrs);
  //markup images our own way:
  txt=txt.replace(/\!\[([^\]]*)\]\(([^\)]+)\)\s*(\{\.(([^\}]+))\})?/g, function(m, caption, filename, x, className){
    return `<figure class="${className}"><div><img src="${filename}" alt=""></div><figcaption>${caption}</figcaption></figure>\n\n`;
  });
  var html=md.render(txt);
  //add target=_blank to outgoing links:
  html=html.replace(/\<a href="http/g, `<a target="_blank" href="http`);
  return html;
}

