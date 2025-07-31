# Opening the Well's ASR API

This API lets you submit ASR (Automatic Speech Recorgnition) pre-transcrips to Opening the Well.
Opening the Well will use the pre-transcripts to assist human transcribers in transcribing the sound recordings. 

## Getting the list of sound files

To get a list of sound files that do not have an ASR pre-transcript yet:

```
GET https://fosgladh.tobarandualchais.co.uk/asr
HEADER password: yourpassword
```
Replace `yourpassword` with the password you have been given.

Response codes:
- 401 Unauthorized (if the password is wrong)
- 200 OK

Response body:
```
[
    {
        "id": 9209,
        "sound_file_url": "https://fosgladh.tobarandualchais.co.uk/getsoundfile?id=9209"
    },
    {
        "id": 9210,
        "sound_file_url": "https://fosgladh.tobarandualchais.co.uk/getsoundfile?id=9210"
    },
    {
        "id": 33013,
        "sound_file_url": "https://fosgladh.tobarandualchais.co.uk/getsoundfile?id=33013"
    }
]
```

You will need the ID of each sound file in the next step.

When you go to GET the sound file URL the response will redirect to another URL where you will actually get the sound file, typically an MP4 file. Yes we have to do this double hop because reasons.


## Submitting an ASR pre-transcript

```
POST https://fosgladh.tobarandualchais.co.uk/asr?id=9209
HEADER password: yourpassword
HEADER content-type: application/json
BODY {"text": "Is mise Uilleam Lamb.", "words": [...]}
```
Replace `yourpassword` with the password you have been given, and `9209` with the ID of a sound file.

Response codes:
- 401 Unauthorized (if the password is wrong)
- 503 Service Unavailable (if Opening the Well is currently in read-only mode for maintenance)
- 500 Internal Server Error (if some other problem e.g. the body is invalid JSON)
- 200 OK

There is no response body. If you get 200 OK, the pre-transcript has been accepted, thank you.

Yes you can submit a pre-transcript repeatedly for the same soundfile (the same ID), this won't break anything, The last one wins.