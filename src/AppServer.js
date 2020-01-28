const express = require('express');
const bodyParser = require('body-parser');

const MetricStoreManager = require('./lib/MetricStoreManager');

class AppServer {
  constructor() {
    const { PORT = 3000 } = process.env;
    this.app = express();
    this.app.use(bodyParser.json());
    this.port = PORT;
    this.manager = new MetricStoreManager();

    // Express handle, used for graceful shutdown
    this.handle = null;
    this.initRoutes();
  }

  initRoutes() {
    this.app.post('/metric/:key', (req, res) => {
      const { params: { key }, body: { value } } = req;
      this.manager.getStore(key).add(value);
      return res.send({});
    });

    this.app.get('/metric/:key/sum', (req, res) => {
      const { params: { key } } = req;
      const value = this.manager.getStore(key).sum();
      return res.send({ value });
    });

    this.app.get('*', (req, res) => res.status(501).send('Not implemented'));
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.handle = this.app.listen(this.port, () => resolve()).once('error', reject);
    });
  }

  async stop() {
    return new Promise((resolve, reject) => {
      const stopTimeout = setTimeout(reject, 5000);
      this.handle.close(() => {
        clearTimeout(stopTimeout);
        this.handle = null;
        resolve();
      });
    });
  }
}

module.exports = AppServer;
