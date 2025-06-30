export const mailBuilder={
  buildEmail: function(spec){
    let src=`<!DOCTYPE html>
<html lang="${spec.uilang}" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title></title>
    <!--[if mso]>
    <style>
    table {border-collapse:collapse;border-spacing:0;border:none;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
    </style>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap');
      table, td, div, h1, p {
          font-family: 'Source Sans Pro', Arial, sans-serif;
      }
    </style>
  </head>
  <body style="margin:0;padding:0;word-spacing:normal;background-color:#eeeeee;">
    <div role="article" aria-roledescription="email" lang="${spec.uilang}" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#eeeeee;">

      <!--[Scaffold goes here]-->
      <table role="presentation" style="width:100%;border:none;border-spacing:0;">
      <tr>
        <td align="center" style="padding:0;">
            
          <!--[Ghost Table goes here]-->
          <!--[if mso]>
          <table role="presentation" align="center" style="width:600px;">
          <tr>
          <td>
          <![endif]-->

          <!--[Container goes here]-->
          <table role="presentation" style="width:94%;max-width:600px;border:none;border-spacing:0;text-align:left;font-family:'Source Sans Pro',Arial,sans-serif;font-size:17px;line-height:26px;color:#363636;">
            
            <!--[Rows go here]-->    
    `;

    //logo and header:
    src+=`
    <tr>
      <td style="padding:40px 20px 30px 20px;text-align:center;font-size:20px;">
        <a href="${process.env.URLSTART}/${spec.uilang}" style="text-decoration:none;">
          ${spec.title}
        </a>
      </td>
    </tr>
    `;

    spec.rows.map(row => {

      if(row.type=="confirm"){
        src+=`
            <tr>
              <td style="padding:20px 20px 0px 20px;background-color:#ffffff;">
                <p style="margin:0;">
                  ${row.intro}
                </p>
                <p style="margin:30px 0px 30px 0px;text-align:center"><a href="${process.env.URLSTART}${row.path}" style="background: #eeeeee; text-decoration: none; padding: 5px 25px; color:rgb(74, 122, 210); border-radius: 4px; display:inline-block; mso-padding-alt:0;text-underline-color:#d24a4a;border:1px solid #dddddd;"><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%;mso-text-raise:20pt">&nbsp;</i><![endif]--><span style="mso-text-raise:10pt;">${row.caption}</span><!--[if mso]><i style="letter-spacing: 25px;mso-font-width:-100%">&nbsp;</i><![endif]--></a></p>
              </td>
            </tr>
        `;
      }
      
      if(row.type=="greeting"){
        src+=`
            <tr>
              <td style="padding:20px 20px 0px 20px;background-color:#ffffff;">
                <p style="margin:0;">
                  ${row.text}
                </p>
              </td>
            </tr>
        `;
      }
      

    });

    //footer:
    src+=`
      <tr>
        <td style="padding:30px;text-align:center;">
          <p style="margin:0;font-size:15px;line-height:26px;color:#666666">
            ${spec.footerText}
          </p>
        </td>
      </tr>
    `;

    src+=`
          </table>

          <!--[if mso]>
          </td>
          </tr>
          </table>
          <![endif]-->

        </td>
      </tr>
    </table>

    </div>
  </body>
</html>`;

    return src;
  },
};