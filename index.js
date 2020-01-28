const Console = console;
const AppServer = require('./src/AppServer');

const appServer = new AppServer();

appServer.start()
  .then(() => {
    Console.info('Running on port %d', appServer.port);
  }).catch((err) => {
    Console.error('Error', err);
  });
