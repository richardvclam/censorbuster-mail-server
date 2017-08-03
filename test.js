const api = require('./api.js');

function sendMail(to, subject) {
  return api.getToken()
    .then(api.getDVP)
    .then(text => api.sendMail(to, subject, JSON.stringify(text)))
    .then(console.log)
    .catch(console.error);
}

sendMail('richardvclam@gmail.com', 'Test subject');
