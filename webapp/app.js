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
  res.status(404).render("404.ejs", {});
}

//Hook up our endpoints:
import page_home from "./pages/home/server.js";
  page_home(app, L, do404, __dirname);
import page_login from "./pages/login/server.js";
  page_login(app, L, do404, __dirname);
import page_logout from "./pages/logout/server.js";
  page_logout(app, L, do404, __dirname);
import page_sendmail from "./pages/sendmail/server.js";
  page_sendmail(app, L, do404, __dirname);
import page_sound from "./pages/sound/server.js";
  page_sound(app, L, do404, __dirname);
import page_getsoundfile from "./pages/getsoundfile/server.js";
  page_getsoundfile(app, L, do404, __dirname);

//Block HTTP access to server-side code:
app.all("/*/server.js", do404);
app.all("/*/view.ejs", do404);

//Our static files and 404 page:
app.use("/", express.static(path.join(__dirname, "pages")));
app.use("/", express.static(path.join(__dirname, "includes")));
app.use("/", express.static(path.join(__dirname, "icons")));
app.use("/", express.static(path.join(__dirname, "components")));
app.use("/sounds/", express.static(path.join(__dirname, "sounds")));
app.use(do404);

//Start listening:
app.listen(PORT);
console.log("Process ID "+process.pid+" is now listening on port number "+PORT+".");
