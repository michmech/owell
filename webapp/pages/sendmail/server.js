import sqlite from "better-sqlite3";
import nodemailer from "nodemailer";

export default function(app, L, do404, rootdir){

  app.get("/:uilang(gd|en)/sendmail/", function(req, res){
    const result={};

    let transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    });

    transporter.sendMail({
      from: 'info@openingthewell.cahss.ed.ac.uk',
      to: 'michmech@lexiconista.com',
      subject: 'Message',
      text: 'I hope this message gets delivered!'
    }, (err, info) => {
      result.err = err;
      result.info = info;

      res.render("sendmail/view.ejs", {
        uilang: req.params.uilang,
        L: multistring => L(req.params.uilang, multistring),
        pageTitle: L(req.params.uilang, "Opening The Well"),
        pageDescription: L(req.params.uilang, "Well well well.."),
        pageUrls: {
          "gd": "/gd/",
          "en": "/en/",
        },
        isHomepage: false,
        result,
      });

    });
 });
}