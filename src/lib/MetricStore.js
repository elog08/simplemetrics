/* eslint-disable no-restricted-syntax */
const TIME_ONE_SECOND = 1000;
const TIME_ONE_MINUTE = 60 * TIME_ONE_SECOND;
const TIME_ONE_HOUR = 60 * TIME_ONE_MINUTE;

const PARTITION_MS = 1;

class MetricStore {
  constructor(options = {}) {
    this.store = new Map();
    this.maxMemory = options.maxMemory || TIME_ONE_HOUR;
    this.partition = options.partition || PARTITION_MS;
  }

  add(value) {
    const parsedValue = parseInt(value, 10);
    if (!Number.isNaN(parsedValue)) {
      const timestamp = Date.now();
      const timeKey = this.partition > 1 ? Math.round(timestamp / this.partition) : timestamp;
      const currentVal = this.store.get(timeKey) || 0;
      this.store.set(timeKey, currentVal + parsedValue);
    }
    return parsedValue;
  }

  sum() {
    const timeLimit = Date.now() - this.maxMemory;
    let sum = 0;
    for (const [timestamp, value] of this.store.entries()) {
      if ((timestamp * this.partition) >= timeLimit) {
        sum += value;
      } else {
        this.store.delete(timestamp);
      }
    }
    return sum;
  }
}

module.exports = MetricStore;
