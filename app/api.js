require('dotenv').config();
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
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
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
 * Returns a promise containing an admin's authorization token.
 * Makes an HTTP POST request containing admin credentials.
 */
function getToken() {
  // TODO cache the admin token
  const options = {
    uri: 'http://api.censorbuster.com/auth/login',
    method: 'POST',
    form: {
      uuid: process.env.ADMIN_UUID,
      password: process.env.ADMIN_PASSWORD,
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
 * Retrieves all available dynamic volunteer proxy's (DVP) by making an
 * HTTP GET request to the command control using the client's UUID.
 * Returns a promise containing an array of DVP containing their IP address,
 * availability, and RSA public key.
 * @param {String} adminToken an admin's JSON web token from login procedure
 * @param {String} clientUUID a client's UUID
 */
function getDVP(adminToken, clientUUID) {
  const options = {
    uri: `https://api.censorbuster.com/api/client/${clientUUID}`,
    method: 'GET',
    json: true,
    headers: { Authorization: `Bearer ${adminToken}` },
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
 * Registers a new client by making an HTTP POST request to the command control.
 * Returns a promise containing the client's UUID.
 * @param {String} adminToken an admin's JSON web token from login procedure
 */
function registerClient(adminToken) {
  const options = {
    uri: 'http://api.censorbuster.com/api/client',
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
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
 * @param {String} to email recipient
 */
function sendDVPList(to, uuid) {
  return getToken()
    .then(token => getDVP(token, uuid))
    .then(text => sendMail(to, 'New DVP List', JSON.stringify(text)))
    .then(console.log)
    .catch(console.error);
}

/**
 * Registers a new client and sends the credentials to an email recipient.
 * @param {String} to email recipient
 */
function sendInvitation(to) {
  return getToken()
    .then(registerClient)
    .then(credentials => sendMail(
      to, 'Invitation from CensorBuster', JSON.parse(credentials).uuid))
    .then(console.log)
    .catch(console.error);
}

module.exports = {
  sendMail,
  sendDVPList,
  sendInvitation,
};
