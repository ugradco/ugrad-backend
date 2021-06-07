const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

const user = process.env.AWS_SMTP_USER;
const pass = process.env.AWS_SMTP_USER_PASS;
const defaultEmail = process.env.MAIL_NOREPLY;

const transport = nodemailer.createTransport({
  port: 465,
  host: "email-smtp.eu-central-1.amazonaws.com",
  secure: true,
  auth: {
    user,
    pass,
  },
  debug: true,
});

function sendEmail(mailOptions) {
  return transport.sendMail({ from: `UGrad <${defaultEmail}>`, ...mailOptions }).catch((err) => console.log(err));
}

async function sendVerificationTokenEmail(user, token) {
  readHTMLFile(path.join(__dirname, "/../Assets/emails/verification.html"), function (err, html) {
    const template = handlebars.compile(html);
    const replacements = {
      token,
    };
    const htmlToSend = template(replacements);

    const subject = "UGrad Verification Code: " + token;
    const to = user.email;
    // const link = "http://" + req.headers.host + "/api/auth/verify/" + token.token;

    const mailOptions = {
      from: `UGrad <${defaultEmail}>`,
      to,
      subject,
      html: htmlToSend,
    };

    transport.sendMail(mailOptions).catch((err) => console.log(err));
  });

  return;
}

module.exports = { sendEmail, sendVerificationTokenEmail };
