import sqlite from "better-sqlite3";

export default function(app, L, do404, rootdir){

  app.get("/", function(req, res){
    res.redirect("/gd/");
  });

  app.get("/:uilang(gd|en)/", function(req, res){
    const db=new sqlite("../databases/database.sqlite", {fileMustExist: true});
    
    let testValue="nothing"; 

    try{
      //get something from DB:
      {
        const sql=`
          select test_value from test_table 
        `;
        const sqlSelect=db.prepare(sql);
        sqlSelect.all().map(row => {
          testValue=row["test_value"];
        });
      }
    } catch(e){
      console.log(e);
    } finally {
      db.close();
    }

    res.render("home/view.ejs", {
      uilang: req.params.uilang,
      L: multistring => L(req.params.uilang, multistring),
      pageTitle: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageDescription: L(req.params.uilang, "Fosgladh an Tobair|Opening The Well"),
      pageUrls: {
        "gd": "/gd/",
        "en": "/en/",
      },
      isHomepage: true,
      testValue,
    });
  });
  
}