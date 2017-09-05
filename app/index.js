const emailServer = require('./email-server');
const httpServer = require('./http-server');

httpServer.start();
emailServer.start();

