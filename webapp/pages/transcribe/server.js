import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/:uilang(gd|en)/transcribe", function(req, res){
    res.render("transcribe/view.ejs", {
      uilang: req.params.uilang,
      L: multistring => L(req.params.uilang, multistring),
      pageTitle: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageDescription: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageUrls: {
        "gd": "/gd/transcribe",
        "en": "/en/transcribe",
      },
      isHomepage: false,
    });
  });
  
}