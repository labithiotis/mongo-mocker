'use strict';
const MongoMocker = require('./index');

describe('MongoMocker', () => {
  let mongo;

  before(() => {
    mongo = new MongoMocker();
  });

  afterEach(() => {
    mongo.mock.clearAll();
  });

  it('ensureIndex', function* () {
    expect(yield mongo.ensureIndex('blah', { index: 1 })).to.deep.equal({ index: 1 });
  });

  describe('Basic functionality', () => {
    it('should init with initial data', function () {
      mongo = new MongoMocker({ test: [], example: [{ object: 1 }, { object: 2 }] });
      expect(mongo.mock.getCollectionData('example')).to.deep.equal([{ object: 1 }, { object: 2 }]);
    });

    it('should insert document', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: '1' });
      const data = mongo.mock.getCollectionData('test');
      expect(data[0]).to.be.a('object');
      expect(data[0]).to.have.keys(['_id', 'test']);
      expect(data[0].test).to.equal('1');
    });

    it('should findOne document', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: '1', other: 2 });
      const doc = yield collection.findOne({ test: '1' });
      expect(doc).to.be.a('object');
      expect(doc).to.have.keys(['_id', 'test', 'other']);
      expect(doc.test).to.equal('1');
      expect(doc.other).to.equal(2);
    });

    it('should support operators', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: 20 });
      const doc = yield collection.findOne({ test: { $gt: 10 } });
      expect(doc).to.be.a('object');
      expect(doc).to.have.keys(['_id', 'test']);
      expect(doc.test).to.equal(20);
    });

    it('should support promise pattern', function(done) {
      mongo.collection('test').then((collection) => {
        collection.insert({ test: '1' }).then(() => {
          const data = mongo.mock.getCollectionData('test');
          expect(data[0]).to.be.a('object');
          expect(data[0]).to.have.keys(['_id', 'test']);
          expect(data[0].test).to.equal('1');
          done();
        }).catch(done);
      }).catch(done);
    });

    it('should support sort method', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: 20 });
      yield collection.insert({ test: 10 });
      yield collection.insert({ test: 30 });
      const data = yield collection.find({ test: { $gt: 5 } }).sort({ test: 1 }).toArray();
      expect(data[0]).to.be.a('object');
      expect(data[0].test).to.equal(10);
    });

    it('should support sort method', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: 20 });
      yield collection.insert({ test: 10 });
      yield collection.insert({ test: 30 });
      const data = yield collection.find({ test: { $gt: 5 } }).sort({ test: -1 }).toArray();
      expect(data[0]).to.be.a('object');
      expect(data[0].test).to.equal(30);
    });
  });

  describe('Mock methods', () => {
    it('clear', function() {
      mongo = new MongoMocker({ test: [{ test: 1 }] });
      expect(mongo.mock.getCollectionData('test').length, 'collection is empty instead of containing one').to.equal(1);
      mongo.mock.clear();
      expect(mongo.mock.getCollectionData('test').length, 'collection is empty instead of containing one').to.equal(1);
      mongo.mock.clear('test');
      expect(mongo.mock.getCollectionData('test').length, 'collection is not empty after .clear()').to.equal(0);
    });

    it('clearAll', function() {
      mongo = new MongoMocker({ test1: [{ test1: 1 }], test2: [{ test2: 1 }] });
      expect(mongo.mock.getCollectionData('test1').length, 'collection is empty instead of containing one').to.equal(1);
      expect(mongo.mock.getCollectionData('test2').length, 'collection is empty instead of containing one').to.equal(1);
      mongo.mock.clearAll();
      expect(mongo.mock.getCollectionData('test1').length, 'collection is not empty after .clearAll()').to.equal(0);
      expect(mongo.mock.getCollectionData('test2').length, 'collection is not empty after .clearAll()').to.equal(0);
    });

    it('getCollectionData', function() {
      mongo = new MongoMocker({ test1: [{ _id: 1, test1: 1 }, { _id: 2, test2: 2 }], test2: [{ test2: 1 }] });
      const data = mongo.mock.getCollectionData('test1');
      expect(data[0]).to.deep.equal({ _id: 1, test1: 1 });
      expect(data[1]).to.deep.equal({ _id: 2, test2: 2 });
    });
  });
});
