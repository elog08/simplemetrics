const MetricStore = require('./MetricStore');

class MetricStoreManager {
  constructor() {
    this.metrics = new Map();
  }

  getStore(key) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, new MetricStore());
    }
    return this.metrics.get(key);
  }
}

module.exports = MetricStoreManager;
