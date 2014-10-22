/*globals describe, require */

var LinearRegression = require('./index').LinearRegression,
    assert = require('assert'),
    sinon = require('sinon');

var fixtures = {};

var EPSILON = 0.01; // used to compare floats

describe('LinearRegresssion', function() {
  describe('initialization', function() {
    it('can be initialized with no parameters', function(done) {
      var lr = new LinearRegression();
      assert.ok(lr);
      done();
    });

    it('should throw an error if X is not an array', function(done) {
      var x = 'a string';
      assert.throws(function() {
        var lr = new LinearRegression(x);
      }, Error);
      done();
    });

    it('should throw an error if Y is not an array', function(done) {
      var x = [1];
      var y = 'a string';
      assert.throws(function() {
        var lr = new LinearRegression(x, y);
      }, Error);
      done();
    });
  });

  describe('train', function() {
    it('should throw an error if there is no data in X', function(done) {
      var lr = new LinearRegression();
      lr.train(function(err) {
        assert.ok(err);
        assert.equal(err.message, 'X is empty');
        done();
      });
    });
    it('should throw an error if there is no data in Y', function(done) {
      var lr = new LinearRegression([0,1,2,3]);
      lr.train(function(err) {
        assert.ok(err);
        assert.equal(err.message, 'Y is empty');
        done();
      });
    });
    it('should throw an error if X and Y have different length', function(done) {
      var lr = new LinearRegression([0,1,2], [0]);
      lr.train(function(err) {
        assert.ok(err);
        assert.equal(err.message, 'X and Y must be of the same length');
        done();
      });
    });
    it('should throw an error on vertical line since we cannot inverse matrix', function(done) {
      var lr = new LinearRegression([0, 0], [1,0]);
      lr.train(function(err) {
        assert.ok(err);
        assert.equal(err.message, 'could not inverse the matrix in normal equation');
        done();
      });
    });
  });

  describe('predict', function() {
    it('should throw an error if called before training', function(done) {
      var lr = new LinearRegression([0,1,2,3,4], [1,3,4,5,6]);
      assert.throws(function() {
        lr.predict(1);
      }, Error);
      done();
    });
  });

  function predictionTests() {
    it('should correctly generates a line for a 0,0 to 1,1 dataset (slope of 1)', function(done) {
      var lr = new LinearRegression([0, 1], [0,1], fixtures.options);
      lr.train(function(err) {
        assert.ok(lr.predict(0) - 0 < EPSILON);
        assert.ok(lr.predict(0.5) -  0.5 < EPSILON);
        assert.ok(lr.predict(1) - 1 < EPSILON);
        done();
      });
    });
    it('should correctly generates a line for a (0,0) to (1,0) dataset (horizontal line)', function(done) {
      var lr = new LinearRegression([0, 1], [0,0], fixtures.options);
      lr.train(function(err) {
        assert.equal(lr.predict(0), 0);
        assert.equal(lr.predict(0.5), 0);
        assert.equal(lr.predict(1), 0);
        done();
      });
    });
    it('should correctly generates a line for a (0,5) to (1,5) dataset (horizontal line)', function(done) {
      var lr = new LinearRegression([0, 1], [5,5], fixtures.options);
      lr.train(function(err) {
        assert.ok(lr.predict(0) - 5 < EPSILON);
        assert.ok(lr.predict(0.5) - 5 < EPSILON);
        assert.ok(lr.predict(1) - 5 < EPSILON);
        done();
      });
    });
    it('should handle single point input of (0,0)', function(done) {
      var lr = new LinearRegression([0], [0], fixtures.options);
      lr.train(function(err) {
        assert.equal(lr.predict(10), 0);
        done();
      });
    });
    it('should handle a single point example by returning y-intercept', function(done) {
      var lr = new LinearRegression([0], [1], fixtures.options);
      lr.train(function(err) {
        assert.equal(lr.predict(5), 5);
        done();
      });
    });
    it('should predict a simple example correctly', function(done) {
      var lr = new LinearRegression([1, 2, 3, 4, 5], [2, 2, 3, 3, 5], fixtures.options);
      lr.train(function(err) {
        assert.ok(lr.predict(0) - 0.899 < EPSILON);
        assert.ok(lr.predict(1) - 1.599 < EPSILON);
        assert.ok(lr.predict(2) - 2.3 < EPSILON);
        assert.ok(lr.predict(3) - 2.999 < EPSILON);
        assert.ok(lr.predict(4) - 3.699 < EPSILON);
        assert.ok(lr.predict(5) - 4.4 < EPSILON);
        assert.ok(lr.predict(10) - 7.9 < EPSILON);
        done();
      });
    });
  }

  describe('train and predict', function() {
    it('should train with Normal Equation by default', function(done) {
      var lr = new LinearRegression([1, 2, 3, 4, 5], [2, 2, 3, 3, 5]);
      assert.ok(lr.algorithm, 'NormalEquation');
      var spy = sinon.spy(lr, 'trainWithNormalEquation');
      lr.train(function(err) {
        assert.ok(spy.called);
        done();
      });
    });
    it('should train with Normal Equation if asked to do so', function(done) {
      var lr = new LinearRegression([1, 2, 3, 4, 5], [2, 2, 3, 3, 5], {algorithm: 'NormalEquation'});
      assert.ok(lr.algorithm, 'NormalEquation');
      var spy = sinon.spy(lr, 'trainWithNormalEquation');
      lr.train(function(err) {
        assert.ok(spy.called);
        done();
      });
    });
    it('should train with GradientDescent if asked to do so', function(done) {
      var lr = new LinearRegression([1, 2, 3, 4, 5], [2, 2, 3, 3, 5], {algorithm: 'GradientDescent'});
      assert.ok(lr.algorithm, 'GradientDescent');
      var spy = sinon.spy(lr, 'trainWithGradientDescent');
      lr.train(function(err) {
        assert.ok(spy.called);
        done();
      });
    });
    describe('with Normal Equation', function() {
      predictionTests();
    });
    describe('with Gradient Descent', function() {
      beforeEach(function(callback) {
        fixtures.options = {algorithm: 'GradientDescent'};
        return callback();
      });
      predictionTests();
    });
  });
});
