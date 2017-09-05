const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const api = require('./api');

const app = express();
const port = 8888;
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get('/', (req, res) => {
  res.send('Hello! You have reached the CensorBuster email server.');
});

app.get('/invite', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/invite.html'));
});

app.post('/invite-confirmation', urlencodedParser, (req, res) => {
  const response = { email: req.body.email };
  console.log(response);
  res.end(JSON.stringify(response));
  api.sendInvitation(response.email);
});

function start() {
  app.listen(port, () => {
    console.log(`[HTTP Server] Listening to port ${port}.`);
  });
}

module.exports = { start };
