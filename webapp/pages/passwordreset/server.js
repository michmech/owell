import sqlite from "better-sqlite3";
import nodemailer from "nodemailer";
import {mailBuilder} from "../../mailBuilder.js";
// import fs from "fs/promises";

export default function(app, L, do404, rootdir){

  //the password reset form, before submission:
  app.get("/:uilang(gd|en)/(facal-faire-air-diochuimhne|forgot-password)", function(req, res){
    const email=req.cookies.email;
    const sessionKey=req.cookies.sessionkey;
    let loggedIn=false;
    
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      { //check if the user is already logged in:
        let yesterday=(new Date()); yesterday.setHours(yesterday.getHours()-24); yesterday=yesterday.toISOString();
        const sql=`select email from users where lower(email)=lower($email) and sessionKey=$sessionKey and lastSeen>=$yesterday`;
        const stmt=db.prepare(sql);
        stmt.all({email, sessionKey, yesterday}).map(row => { loggedIn=true; });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    if(loggedIn){
      res.redirect(`/${req.params.uilang}`);
    } else {
      res.render("passwordreset/view.ejs", {
        uilang: req.params.uilang,
        userDisplayName: "",
        userROWID: 0,
        loggedIn,
        email,
  
        L: multistring => L(req.params.uilang, multistring),
        pageTitle: L(req.params.uilang, "#sitetitle"),
        pageDescription: L(req.params.uilang, "#sitedescription"),
        pageUrls: {
          "gd": "/gd/facal-faire-air-diochuimhne",
          "en": "/en/forgot-password",
        },
        isHomepage: false,
  
        resetAttempted: false,
      });
    }

  });

  //the password reset form, after submission:
  app.post("/:uilang(gd|en)/(facal-faire-air-diochuimhne|forgot-password)", function(req, res){
    let loggedIn = false;
    const email = req.body.email;
    let userROWID=0;
    let userDisplayName="";

    const registrationKey=generateKey();
    const now=(new Date()).toISOString();
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    try{
      {
        const sql=`update users set registrationKey=$registrationKey where lower(email)=lower($email)`;
        const stmt=db.prepare(sql);
        stmt.run({email, registrationKey});
      }
      {
        //send confirmation email:
        const path=`/${req.params.uilang}/${L(req.params.uilang, "facal-faire-air-diochuimhne2|forgot-password2")}?e=${email}&k=${registrationKey}`;
        sendmail(email, path, (multistring, subpart) => L(req.params.uilang, multistring, subpart), req.params.uilang);
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }
    
    res.render("passwordreset/view.ejs", {
      uilang: req.params.uilang,
      userDisplayName: "",
      userROWID: 0,
      loggedIn,
      email,

      L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
      pageTitle: L(req.params.uilang, "#sitetitle"),
      pageDescription: L(req.params.uilang, "#sitedescription"),
      pageUrls: {
        "gd": "/gd/facal-faire-air-diochuimhne",
        "en": "/en/forgot-password",
      },
      isHomepage: false,
      
      resetAttempted: true,
    });
});
}

function generateKey(){
  var alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var key="";
  while(key.length<32) {
    var i=Math.floor(Math.random() * alphabet.length);
    key+=alphabet[i]
  }
  return key;
}

function sendmail(to, path, L, uilang){
  const html=mailBuilder.buildEmail({
    title: L("#sitetitle"),
    uilang: uilang,
    rows: [{
      type: "confirm",
      intro: `<b>${L("#forgotpassword")}</b> ${L("#emailresetline1")}`,
      caption: L("#changepassword"),
      path: path,
    }],
    footerText: `${L("#emailresetexplanation")}`,
  });
  // fs.writeFile("./test.html", html);
  let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
  });
  transporter.sendMail({
    from: `"${L("#sitetitle")}" <process.env.SENDEREMAIL>`,
    to: to,
    subject: L("#changepassword"),
    html: html,
  }, (err, info) => {
    if(err) console.log(err);
    if(info) console.log(info);
  });
}
