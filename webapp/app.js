import express from "express";
const app=express();
import path from "path";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded
import cookieParser from 'cookie-parser';
app.use(cookieParser());
import { SHA3 } from "sha3";

const PORT=process.env.PORT||80;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//our function for hashing passwords:
app.hash = (s) => {
  const hash = new SHA3(512);
  hash.update(s);
  return hash.digest('hex');
};

//www redirect:
function wwwRedirect(req, res, next){
  if(/^[^\.]+\.[^\.]+$/.test(req.headers.host)){
    var newHost="www."+req.headers.host;
    return res.redirect(301, req.protocol+"://"+newHost+req.originalUrl);
  }
  next();
};
app.set("trust proxy", true);
app.use(wwwRedirect);

//Our views:
app.set("views", path.join(__dirname, "pages"));
app.set("view engine", "ejs"); //http://ejs.co/

//Localization:
import strings from "./strings.json" with { type: "json" }; //this only works in Node.js v22 (or thereabouts) and above
const L=function(uilang, multistring, subpart){
  if(multistring.startsWith("#")){
    let string=multistring
    if(strings[multistring] && strings[multistring][uilang]) string=strings[multistring][uilang];
    subpart = subpart || 0;
    const substrings=string.split("$");
    if(substrings.length>subpart) return substrings[subpart];
    return string;
  }
  const arr=multistring.split("|");
  if(uilang=="gd" && arr.length>0) return arr[0];
  if(uilang=="en" && arr.length>1) return arr[1];
  return multistring;
};

//404:
function do404(req, res){
  res.status(404).render("404/view.ejs", {});
}

//Read-only:
function doReadOnly(req, res){
  res.status(503).render("readonly/view.ejs", {
    uilang: req.params.uilang,
    userDisplayName : "",
    userROWID : 0,
    loggedIn: false,
    email : "",
    isAdmin: false,
    L: (multistring, subpart) => L(req.params.uilang, multistring, subpart),
    pageTitle: L(req.params.uilang, "#sitetitle"),
    pageDescription: L(req.params.uilang, "#sitedescription"),
    pageUrls: {
      "gd": req.path.replace(/^\/../, "/gd"),
      "en": req.path.replace(/^\/../, "/en"),
    },
    isHomepage: false,
  });
}

//Hook up our API endpoints:
import api_getsoundfile from "./api/getsoundfile/server.js";
  api_getsoundfile(app, L, do404, doReadOnly, __dirname);
import api_tadget from "./api/tadget/server.js";
  api_tadget(app, L, do404, doReadOnly, __dirname);
import api_list from "./api/list/server.js";
  api_list(app, L, do404, doReadOnly, __dirname);
import api_delete from "./api/delete/server.js";
  api_delete(app, L, do404, doReadOnly, __dirname);
import api_giveup from "./api/giveup/server.js";
  api_giveup(app, L, do404, doReadOnly, __dirname);
import api_difficulty from "./api/difficulty/server.js";
  api_difficulty(app, L, do404, doReadOnly, __dirname);
import api_promote from "./api/promote/server.js";
  api_promote(app, L, do404, doReadOnly, __dirname);
import api_demote from "./api/demote/server.js";
  api_demote(app, L, do404, doReadOnly, __dirname);

//Hook up our webpage-serving endpoints:
import page_home from "./pages/home/server.js";
  page_home(app, L, do404, doReadOnly, __dirname);
import page_login from "./pages/login/server.js";
  page_login(app, L, do404, doReadOnly, __dirname);
import page_logout from "./pages/logout/server.js";
  page_logout(app, L, do404, doReadOnly, __dirname);
import page_sound from "./pages/sound/server.js";
  page_sound(app, L, do404, doReadOnly, __dirname);
import page_register from "./pages/register/server.js";
  page_register(app, L, do404, doReadOnly, __dirname);
import page_register2 from "./pages/register2/server.js";
  page_register2(app, L, do404, doReadOnly, __dirname);
import page_passwordchange from "./pages/passwordchange/server.js";
  page_passwordchange(app, L, do404, doReadOnly, __dirname);
import page_passwordreset from "./pages/passwordreset/server.js";
  page_passwordreset(app, L, do404, doReadOnly, __dirname);
import page_passwordreset2 from "./pages/passwordreset2/server.js";
  page_passwordreset2(app, L, do404, doReadOnly, __dirname);
import page_user from "./pages/user/server.js";
  page_user(app, L, do404, doReadOnly, __dirname);
import page_users from "./pages/users/server.js";
  page_users(app, L, do404, doReadOnly, __dirname);
import page_info from "./pages/info/server.js";
  page_info(app, L, do404, doReadOnly, __dirname);
import page_editprofile from "./pages/editprofile/server.js";
  page_editprofile(app, L, do404, doReadOnly, __dirname);
import page_deleteaccount from "./pages/deleteaccount/server.js";
  page_deleteaccount(app, L, do404, doReadOnly, __dirname);
import page_log from "./pages/log/server.js";
  page_log(app, L, do404, doReadOnly, __dirname);

//Block HTTP access to server-side code:
app.all("/*/server.js", do404);
app.all("/*/view.ejs", do404);
app.all("/tadget/getter.js", do404);

//Our static files and 404 page:
app.use("/", express.static(path.join(__dirname, "id")));
app.use("/", express.static(path.join(__dirname, "pages")));
app.use("/", express.static(path.join(__dirname, "includes")));
app.use("/", express.static(path.join(__dirname, "icons")));
app.use("/", express.static(path.join(__dirname, "components")));
app.use("/sounds/", express.static(path.join(__dirname, "sounds")));
app.use(do404);

//Start listening:
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
