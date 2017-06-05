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

    it('should insert many documents', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert([
        { test: '1' },
        { test: '2' }
      ]);
      const data = mongo.mock.getCollectionData('test');
      expect(data[0]).to.be.a('object');
      expect(data[1]).to.be.a('object');
      expect(data[1]).to.have.keys(['_id', 'test']);
      expect(data[1].test).to.equal('2');
    });

    it('should create new references for inserted data', function* () {
      const collection = yield mongo.collection('test');
      const data = { test: '1' };
      yield collection.insert(data);
      yield collection.update({ test: '1' }, {
        $set: { test: '2' }
      });
      const updatedData = mongo.mock.getCollectionData('test')[0];
      expect(data.test).to.equal('1');
      expect(updatedData.test).to.equal('2');
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

    it('should find many documents', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: '1' });
      yield collection.insert({ test: '2' });
      const docs = yield collection.find({}).toArray();
      expect(docs).to.be.a('array');
      expect(docs.length).to.be.equal(2);
    });

    it('should limit documents', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: '1' });
      yield collection.insert({ test: '2' });
      const docs = yield collection.find({}).limit(1).toArray();
      expect(docs).to.be.a('array');
      expect(docs.length).to.be.equal(1);
    });

    it('should skip documents', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: '1' });
      yield collection.insert({ test: '2' });
      const docs = yield collection.find({}).skip(1).toArray();
      expect(docs).to.be.a('array');
      expect(docs.length).to.be.equal(1);
      expect(docs[0].test).to.be.equal('2');
    });

    it('should combine limit and skip for documents', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: '1' });
      yield collection.insert({ test: '2' });
      yield collection.insert({ test: '3' });
      const docs = yield collection.find({}).skip(1).limit(2).toArray();
      expect(docs).to.be.a('array');
      expect(docs.length).to.be.equal(2);
      expect(docs.pop().test).to.be.equal('3');
    });

    it('should support operators', function* () {
      const collection = yield mongo.collection('test');
      yield collection.insert({ test: 20 });
      const doc = yield collection.findOne({ test: { $gt: 10 } });
      expect(doc).to.be.a('object');
      expect(doc).to.have.keys(['_id', 'test']);
      expect(doc.test).to.equal(20);
    });

    it('should support promise pattern', function (done) {
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
    it('.clear should clear specified collection', function() {
      mongo = new MongoMocker({ test: [{ test: 1 }] });
      expect(mongo.mock.getCollectionData('test').length, 'collection is empty instead of containing one').to.equal(1);
      mongo.mock.clear();
      expect(mongo.mock.getCollectionData('test').length, 'collection is empty instead of containing one').to.equal(1);
      mongo.mock.clear('test');
      expect(mongo.mock.getCollectionData('test').length, 'collection is not empty after .clear()').to.equal(0);
    });

    it('.clearAll should clear all collections', function() {
      mongo = new MongoMocker({ test1: [{ test1: 1 }], test2: [{ test2: 1 }] });
      expect(mongo.mock.getCollectionData('test1').length, 'collection is empty instead of containing one').to.equal(1);
      expect(mongo.mock.getCollectionData('test2').length, 'collection is empty instead of containing one').to.equal(1);
      mongo.mock.clearAll();
      expect(mongo.mock.getCollectionData('test1').length, 'collection is not empty after .clearAll()').to.equal(0);
      expect(mongo.mock.getCollectionData('test2').length, 'collection is not empty after .clearAll()').to.equal(0);
    });

    it('.getCollectionData should return specified collection', function() {
      mongo = new MongoMocker({ test1: [{ _id: 1, test1: 1 }, { _id: 2, test2: 2 }], test2: [{ test2: 1 }] });
      const data = mongo.mock.getCollectionData('test1');
      expect(data[0]).to.deep.equal({ _id: 1, test1: 1 });
      expect(data[1]).to.deep.equal({ _id: 2, test2: 2 });
    });

    it('.close should return resolved promise', function () {
      mongo = new MongoMocker({ });
      expect(mongo.close()).to.be.a('Promise');
    });
  });
});
