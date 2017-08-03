const nodemailer = require('nodemailer');
const request = require('request');

function sendMail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'censorbustorstest1@gmail.com',
      password: 'cens0r_csulb',
    },
  });

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

function getUserID() {
  const options = {
    uri: 'http://api.censorbuster.com/auth/login',
    method: 'POST',
    form: {
      uuid: 'dbba43f5-1833-4884-982a-9af61b469c35',
      password: 'adminsecret',
    },
    json: true,
    headers: { 'Content-Type': 'application/json' },
  };

  request(options, (err, resposne, body) => {
    if (err) {
      return;
    }

    if (body.token) {
      const authOptions = {
        uri: 'http://api.censorbuster.com/api/client',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${body.token}` },
      };

      request(authOptions, (err, response, body) => {
        if (err) return;

        if (body) {
          return JSON.parse(body).uuid;
        }
      });
    }
  });
}

module.exports = {
  sendMail,
  getUserID,
};
