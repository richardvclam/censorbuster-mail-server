const Imap = require('imap');
const api = require('./api.js');

const fetchDelay = 5000;

const imap = new Imap({
  host: 'imap.gmail.com',
  port: '993',
  tls: true,
  user: 'censorbustorstest1@gmail.com',
  password: 'cens0r_csulb',
});

// Connect to IMAP mail box
imap.once('ready', () => {
  // Open inbox with read-only set to false so we can modify
  // the seen flag.
  imap.openBox('INBOX', false, (err, box) => {
    console.log('Connected to inbox.');
    if (err) throw err;

    // Set an interval for the server to fetch messages
    setInterval(() => {
      // Search for unopened emails
      imap.search(['UNSEEN'], (err, results) => {
        try {
          // Fetch from and subjects fields from emails
          // and mark them as seen.
          const fetch = imap.fetch(results, {
            bodies: 'HEADER.FIELDS (FROM SUBJECT)',
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
                const header = Imap.parseHeader(buffer);
                const email = header.from[0].match(/<(.*?)>/)[1];
                const subject = Imap.parseHeader(buffer).subject[0];

                if (subject === 'new' || subject === 'NEW') {
                  // If subject header contains new or NEW,
                  // send them their user ID.
                  api.sendUserID(email);
                } else if (subject === 'list' || subject === 'LIST') {
                  // If subject header contains list or LIST,
                  // send them a list of DVP IP address and public keys.
                  api.sendDVPList(email);
                }
              });
            });
          });

          fetch.once('error', (err) => {
            console.log(`Fetch error: ${err}`);
          });

          fetch.once('end', () => {
            console.log('Done fetching all messages.');
          });
        } catch (err) {
          console.log('Nothing to fetch.');
        }
      });
    }, fetchDelay);
  });
});

imap.once('error', (err) => {
  console.log(err);
});

imap.once('end', () => {
  console.log('Connection ended');
});

imap.connect();
