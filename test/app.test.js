/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const request = require('supertest');
const { expect } = require('chai');
const AppServer = require('../src/AppServer');
const { generateRandomValues, computeSumOfArray } = require('./shared/helpers');

describe('App Server', function () {
  // Mocha timeout
  this.timeout(10000);
  let server;

  it('exists', function () {
    expect(AppServer).to.be.ok;
  });

  it('instantiates a new server', function () {
    server = new AppServer();
    expect(server).to.be.instanceOf(AppServer);
  });

  it('starts a server', function (done) {
    server.start().then(() => {
      request(server.app).get('/').expect(501).end(done);
    });
  });

  it('stops a server', function (done) {
    server.stop().then(() => {
      // expect(server.app).to.be.null;
      done();
    });
  });

  describe('endpoints', function () {
    before(function (done) {
      server.start().then(() => done());
    });
    it('adds metrics for a new metric', function (done) {
      request(server.app).post('/metric/testKey/')
        .send({ value: 10 })
        .expect(200, done);
    });
    it('gets sum of metrics', function (done) {
      request(server.app).get('/metric/testKey/sum')
        .expect(200)
        .expect(({ body }) => expect(body.value).to.equal(10))
        .end(done);
    });
    it('returns 0 for a non-existent metric', function (done) {
      request(server.app).get('/metric/nonExistent/sum')
        .expect(200)
        .expect(({ body }) => expect(body.value).to.equal(0))
        .end(done);
    });
    describe('handles multiple calls', function () {
      const randomValues = generateRandomValues(5);
      const expectedSum = computeSumOfArray(randomValues);

      // eslint-disable-next-line mocha/no-setup-in-describe
      randomValues.forEach((value, idx) => {
        it(`adds ${idx} random value`, function (done) {
          request(server.app).post('/metric/largeMetric/')
            .send({ value })
            .expect(200, done);
        });
      });

      it('returns computed sum', function (done) {
        request(server.app).get('/metric/largeMetric/sum')
          .expect(({ body }) => expect(body.value).to.equal(expectedSum))
          .expect(200, done);
      });
    });

    after(function (done) {
      server.stop().then(() => {
        done();
      });
    });
  });
},);
