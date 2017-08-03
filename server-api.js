const nodemailer = require('nodemailer');
const request = require('request');

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

function getUserToken() {
  const credentials = JSON.stringify({
    uuid: 'dbba43f5-1833-4884-982a-9af61b469c35',
    password: 'adminsecret',
  });

  request.post('http://api.censorbuster.com/auth/login', {
    json: true,
    body: credentials,
  }, (err, res, body) => {
    console.log(res);
    if (body.token) {
      request.post('http://api.censorbuster.com/api/client', {
        headers: { Authorization: `Bearer ${body.token}` }
      }, (err, res, body) => {
        console.log(body);
        return body;
      });
    }
  });
}

module.exports = {
  sendMail,
  getUserToken,
};
