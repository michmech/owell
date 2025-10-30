# Opening the Well

This repository contains the source code for [Opening the Well](https://fosgladh.tobarandualchais.co.uk), a Scottish Gaelic community transcription website.

## Hello future maintainer, this is what you need to know

The website is written in frameworkless Node.js and can be found in the directory `webapp/`. To run it locally on your dev machine:

```
$ cd webapp
$ copy .dev.env.template .dev.env
$ npm install
$ npm run dev
```

You'll need a reasonably recent version of [Node.js](https://nodejs.org/en). Also, pay attention to the environment variables in `.dev.env`.

Gotchas to be aware of:

- The website uses SQLite as its backend storage. The databases are located in the directory `/databases`. Make sure the website has write access to that directory.

- Inside `databases/`, the file `database.sqlite` is where all the "live" data is, including all user accounts and all the transcriptions that users have submitted. When running in production, you should never overwrite this file and you shoud back it up regularly. If ever you need to touch this file while running in production, put the website into read-only mode by setting the environment variable `READONLY` to `1`, download the file, do what you need to do, re-upload the file, and then set `READONLY` back to `0`. 

- The website needs to be able to send out e-mails when new users sign up and when existing users request password resets.

  - The website uses [Nodemailer](https://nodemailer.com/) for that and expects to be able to send an e-mail simply by dropping it into a directory named `/usr/sbin/sendmail` on the server. Have a look at these two files to see how it's done:

    - `webapp/pages/register/server.js`
    - `webapp/pages/passwordreset/server.js`

  - When sending an e-mail, the website takes the "from" address from the environment variable `SENDEREMAIL`.

- The website talks to [Tobar an Dualchais](https://www.tobarandualchais.co.uk/) API to obtain data about sound recordings, using credentials it finds in the environment variables `TADAPIUSR` and `TADAPIPWD`.

- The website caches sound files in the directory `webapp/sounds/`. Make sure the website has write access to that directory.

- The website provides an API which an external script (running in the University of Edinburgh) uses to submit ASR (Automatic Speech Recorgnition) pre-transcrips to Opening the Well. Read more about that API [here](docs/asr-api.md). The password needed to access the API comes from the environment variable `ASRAPIPWD`.

- The website is bilingual (Gaelic and English). Here's how we handle user-facing UI strings:

  - All "short" UI strings are in the file `loc/strings.txt`. If you make any changes there, go to the directory `loc/` and run `node inject.mjs` in order to "inject" the strings into the website.
  
  - Longer, full-page texts (in Markdown format) are in `webapp/info/` and any associated images are in `webapp/images/`.
