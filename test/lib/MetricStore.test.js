/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable no-unused-expressions */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

const { expect } = require('chai');
const lolex = require('lolex');

const MetricStore = require('../../src/lib/MetricStore');
const { generateRandomValues, computeSumOfArray } = require('../shared/helpers');

const TIME_ONE_SECOND = 1000;
const TIME_ONE_MINUTE = 60 * TIME_ONE_SECOND;
const TIME_ONE_HOUR = 60 * TIME_ONE_MINUTE;
const TIME_24_HOUR = TIME_ONE_HOUR * 24;

describe('MetricStore interface', function () {
  let instance;

  it('exists', function () {
    expect(MetricStore).to.be.ok;
  });
  it('constructs an instance', function () {
    instance = new MetricStore();
    expect(instance).to.be.instanceOf(MetricStore);
  });
  it('exposes functions', function () {
    expect(instance.add).to.be.a('function');
    expect(instance.sum).to.be.a('function');
  });
  it('defaults maxMemory to 1 hr', function () {
    expect(instance.maxMemory).to.equal(TIME_ONE_HOUR);
  });
  it('allows maxMemory override', function () {
    instance = new MetricStore({ maxMemory: TIME_ONE_MINUTE });
    expect(instance.maxMemory).to.equal(TIME_ONE_MINUTE);
  });
});

function runCoreTests(instance, title, numRandomValues = 20) {
  // eslint-disable-next-line mocha/max-top-level-suites
  return describe(title, function () {
    let randomValues = []; let expectedSum; let
      clock;

    before(function () {
      clock = lolex.install({ now: Date.now() });
      randomValues = generateRandomValues(numRandomValues);
      expectedSum = computeSumOfArray(randomValues);
    });

    it('adds a large set of numbers', function () {
      randomValues.forEach((value) => {
        instance.add(value);
        clock.tick(500);
      });
      const actualSum = instance.sum();
      expect(actualSum).to.equal(expectedSum);
    });

    it('never exceeds partition size', function () {
      const maxNum = instance.maxMemory / instance.partition;
      expect(instance.store.size).to.be.lessThan(maxNum);
    });

    after(function () {
      clock.uninstall();
    });
  });
}

describe('MetricStore aggregation', function () {
  let instance; let randomValues = []; let
    expectedSum;

  before(function () {
    randomValues = generateRandomValues();
    expectedSum = computeSumOfArray(randomValues);
  });

  beforeEach(function () {
    instance = new MetricStore();
  });

  it('parses floats into integers', function () {
    const someFloat = 1234.56767;
    const parsed = instance.add(someFloat);
    expect(parsed).to.equal(parseInt(someFloat, 10));
  });

  it('returns a NaN if an invalid value is added', function () {
    const badValue = 'notIntParseable';
    expect(instance.add(badValue)).to.be.NaN;
  });

  it('returns the integer value of the number if a valid value is added', function () {
    const goodValue = 5.4; const
      goodValueInt = 5;
    expect(instance.add(goodValue)).to.equal(goodValueInt);
  });

  it('adds a large set of numbers', function () {
    randomValues.forEach((value) => instance.add(value));
    const actualSum = instance.sum();
    expect(actualSum).to.equal(expectedSum);
  });
});

describe('MetricStore partitioning', function () {
  runCoreTests(new MetricStore(), 'default partitioning');
  runCoreTests(new MetricStore({ partition: TIME_ONE_MINUTE, maxMemory: TIME_24_HOUR }), 'one minute partitioning');
  runCoreTests(new MetricStore({ partition: TIME_ONE_SECOND, maxMemory: TIME_24_HOUR }), 'one second partitioning');
});

describe('MetricStore data expiration', function () {
  let instance;
  let randomValues;
  // eslint-disable-next-line no-unused-vars
  let expectedSum;
  let clock = null;

  let set1; let set2; let expectedSum1; let
    expectedSum2;

  before(function () {
    randomValues = generateRandomValues();
    expectedSum = computeSumOfArray(randomValues);
    clock = lolex.install({ now: Date.now() });
    instance = new MetricStore({
      maxMemory: TIME_ONE_HOUR,
    });

    set1 = generateRandomValues();
    expectedSum1 = computeSumOfArray(set1);

    set2 = generateRandomValues();
    expectedSum2 = computeSumOfArray(set2);
  });

  it('expires entries after 1 hour', function () {
    randomValues.map((value) => instance.add(value));
    clock.tick(TIME_ONE_HOUR + TIME_ONE_MINUTE);
    const actualSum = instance.sum();
    expect(actualSum).to.equal(0);
  });

  it('persists metrics for 15 min', function () {
    // Add set1 metrics at 00:00
    set1.map((value) => instance.add(value));

    // Skip clock to 00:15
    clock.tick(TIME_ONE_MINUTE * 15);
    expect(instance.sum()).to.equal(expectedSum1);
  });


  it('persists metrics for 30 min', function () {
    // Add set2 metrics at ~00:15
    set2.map((value) => instance.add(value));

    // Skip clock to 00:30
    clock.tick(TIME_ONE_MINUTE * 15);

    // The sum should equal the sum of all values
    expect(instance.sum()).to.equal(expectedSum1 + expectedSum2);
  });

  it('expires metrics after 1 hour', function () {
    // Get value at 01:15
    clock.tick(TIME_ONE_MINUTE * 45);

    // The sum should equal the sum of set 2, set 1 should have expired
    expect(instance.sum()).to.equal(expectedSum2);
  });

  it('expires all metrics after 2 hours, 15 min', function () {
    // Get value at 02:15
    clock.tick(TIME_ONE_HOUR);
    expect(instance.sum()).to.equal(0);
    expect(instance.store.size).to.equal(0);
  });


  after(function () {
    clock.uninstall();
  });
});
