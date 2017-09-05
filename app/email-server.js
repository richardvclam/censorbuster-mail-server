require('dotenv').config();
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const api = require('./api');

const imap = new Imap({
  host: 'imap.gmail.com',
  port: '993',
  tls: true,
  user: process.env.EMAIL_USERNAME,
  password: process.env.EMAIL_PASSWORD,
});

// Connect to IMAP mail box
imap.once('ready', () => {
  // Open inbox with read-only set to false so we can modify
  // the seen flag.
  imap.openBox('INBOX', false, (err, box) => {
    console.log('[Mail Server] Connected to inbox.');
    console.log('[Mail Server] Listening for incoming emails...');
    if (err) console.error(err);

    // When a new mail is received...
    imap.on('mail', (num) => {
      console.log('[Mail Server] New mail received!');
      // Search for unopened emails
      imap.search(['UNSEEN'], (err, results) => {
        if (err) console.error(err);

        if (results.length > 0) {
          // Fetch from and subjects fields from emails
          // and mark them as seen.
          const fetch = imap.fetch(results, {
            bodies: '',
            markSeen: true,
          });

          fetch.on('message', (message, sequenceNum) => {
            message.on('body', (stream, info) => {
              let buffer = '';

              // Parse the data from the emails
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });

              // After finishing parsing, send an email
              stream.once('end', () => {
                // const header = Imap.parseHeader(buffer);
                // const email = header.from[0];
                // const subject = Imap.parseHeader(buffer).subject[0];

                simpleParser(buffer, (error, mail) => {
                  if (mail.subject === 'list' || mail.subject === 'LIST') {
                    // If subject header contains list or LIST,
                    // send them a list of DVP IP address and public keys.
                    api.sendDVPList(mail.from.text, mail.text);
                  }
                });
              });
            });
          });

          fetch.once('error', (err) => {
            console.log(`[Mail Server] Fetch error: ${err}`);
          });

          fetch.once('end', () => {
            console.log('[Mail Server] Done fetching all messages.');
          });
        }
      });
    });
  });
});

imap.once('error', (err) => {
  console.log(err);
});

imap.once('end', () => {
  console.log('[Mail Server] Connection ended.');
});

function start() {
  imap.connect();
  console.log('[Mail Server] Connecting to mail inbox...');
}

module.exports = { start };
