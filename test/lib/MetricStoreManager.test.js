/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const { expect } = require('chai');
const MetricsStore = require('../../src/lib/MetricStore');
const MetricStoreManager = require('../../src/lib/MetricStoreManager');

describe('MetricStoreManager', function () {
  let instance; let
    retrievedStore;

  it('exists', function () {
    expect(MetricStoreManager).to.be.ok;
  });
  it('constructs an instance', function () {
    instance = new MetricStoreManager();
    expect(instance).to.be.instanceOf(MetricStoreManager);
  });
  it('exposes functions', function () {
    expect(instance.getStore).to.be.a('function');
  });
  it('defaults to an empty store', function () {
    expect(instance.metrics.size).to.equal(0);
  });
  it('creates a new store if it does not already exist', function () {
    const nonExistentKey = '_non_existent_store';
    expect(instance.getStore(nonExistentKey)).to.be.an.instanceOf(MetricsStore);
  });
  describe('persists the store state', function () {
    const key = 'metric1';

    it('retrieves an existing store', function () {
      retrievedStore = instance.getStore(key);
    });
    it('adds data', function () {
      retrievedStore.add(1);
      retrievedStore.add(2);
      retrievedStore.add(3);
      expect(retrievedStore.sum()).to.equal(6);
    });
    it('retrieves data', function () {
      const computedSum = instance.getStore(key).sum();
      expect(computedSum).to.equal(6);
    });
  });
});
