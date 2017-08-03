const Imap = require('imap');
const inspect = require('util').inspect;
const server = require('./server-api.js');

const fetchDelay = 5000;

const imap = new Imap({
  host: 'imap.gmail.com',
  port: '993',
  tls: true,
  user: 'censorbustorstest1@gmail.com',
  password: 'cens0r_csulb',
});

imap.once('ready', () => {
  imap.openBox('INBOX', true, (err, box) => {
    console.log('Connected to inbox.');
    if (err) throw err;

    // Set an interval for the server to fetch messages
    setInterval(() => {
      imap.search(['UNSEEN'], (err, results) => {
        try {
          const fetch = imap.fetch(results, { bodies: 'HEADER.FIELDS (FROM SUBJECT)' });

          fetch.on('message', (message, sequenceNum) => {
            message.on('body', (stream, info) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });

              stream.once('end', () => {
                const header = Imap.parseHeader(buffer);
                const email = header.from[0].match(/<(.*?)>/)[1];
                const subject = Imap.parseHeader(buffer).subject[0];

                let toSubject;

                if (subject === 'new' || subject === 'NEW') {
                  toSubject = 'Welcome';
                } else if (subject === 'list' || subject === 'LIST') {
                  toSubject = 'New List';
                }
                sendMail(email, subject);
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
          console.log('Nothing to fetch');
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
