const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'censorbustorstest1@gmail.com',
    password: 'cens0r_csulb',
  },
});

function sendMail(to, subject, text) {
  const mailOptions = {
    from: 'censorbustorstest1@gmail.com',
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

module.exports = sendMail;
