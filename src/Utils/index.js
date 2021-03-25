const nodemailer = require("nodemailer");

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
  console.log("fe", defaultEmail);
  return transport
    .sendMail({ from: defaultEmail, ...mailOptions })
    .catch((err) => console.log(err));
}

module.exports = { sendEmail };
