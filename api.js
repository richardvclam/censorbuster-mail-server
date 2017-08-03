const nodemailer = require('nodemailer');
const request = require('request');

/**
 * Returns a promise indicating whether sending the email was successful or not.
 * Sends an email using SMTP SSL using our Gmail account.
 */
function sendMail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'censorbustorstest1@gmail.com',
      pass: 'cens0r_csulb',
    },
  });

  const mailOptions = {
    from: 'censorbustorstest1@gmail.com',
    to,
    subject,
    text,
  };

  return new Promise((success, fail) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) fail(error);

      success(`Message ${info.messageId} sent: ${info.response}`);
    });
  });
}

/**
 * Returns a promise containing an authorization token.
 * Makes a HTTP POST request containing pre-filled user information.
 */
function getToken() {
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

  return new Promise((success, fail) => {
    request(options, (error, response, body) => {
      if (error) fail(error);

      if (body.token) {
        success(body.token);
      } else {
        fail(body.error);
      }
    });
  });
}

/**
 * Returns a promise containing a UUID string.
 * Makes a HTTP POST request with an authorization token in the header.
 */
function getUserID(token) {
  const options = {
    uri: 'http://api.censorbuster.com/api/client',
    method: 'POST',
    json: true,
    headers: { Authorization: `Bearer ${token}` },
  };

  return new Promise((success, fail) => {
    request(options, (error, response, body) => {
      if (error) fail(error);

      if (body.uuid) {
        success(body.uuid);
      } else {
        fail(body.error);
      }
    });
  });
}

/**
 * Returns a promise containing an array of dynamic volunteer proxy's (DVP)
 * IP address, availability, and RSA public key.
 * Makes a HTTP GET request with an authorization token in the header.
 */
function getDVP(token) {
  const options = {
    uri: 'http://api.censorbuster.com/api/client/386f7566-4711-4436-b4cb-2b4d2f694967',
    method: 'GET',
    json: true,
    headers: { Authorization: `Bearer ${token}` },
  };

  return new Promise((success, fail) => {
    request(options, (error, response, body) => {
      if (error) fail(error);

      if (body) {
        success(body);
      } else {
        fail(body.error);
      }
    });
  });
}

/**
 * Sends a list of DVP to an email recipient.
 */
function sendDVPList(to) {
  return getToken()
    .then(getDVP)
    .then(text => sendMail(to, 'New DVP List', JSON.stringify(text)))
    .then(console.log)
    .catch(console.error);
}

/**
 * Sends a user ID to an email recipient.
 */
function sendUserID(to) {
  return getToken()
    .then(getUserID)
    .then(text => sendMail(to, 'Welcome!', JSON.stringify(text)))
    .then(console.log)
    .catch(console.error);
}

module.exports = {
  sendMail,
  getToken,
  getUserID,
  getDVP,
  sendDVPList,
  sendUserID,
};
