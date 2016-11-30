const MongoMocker = require('./index');

describe('MongoMocker', () => {
  let mongo;

  before(() => {
    mongo = new MongoMocker();
  });

  afterEach(() => {
    mongo.mock.clearAll();
  });

  it('Should insert document', function* () {
    const collection = yield mongo.collection('test');
    yield collection.insert({ test: '1' });
    const data = mongo.mock.getCollectionData('test');
    expect(data[0]).to.be.a('object');
    expect(data[0]).to.have.keys(['_id', 'test']);
    expect(data[0].test).to.equal('1');
  });

  it('Should findOne document', function* () {
    const collection = yield mongo.collection('test');
    yield collection.insert({ test: '1', other: 2 });
    const doc = yield collection.findOne({ test: '1' });
    expect(doc).to.be.a('object');
    expect(doc).to.have.keys(['_id', 'test', 'other']);
    expect(doc.test).to.equal('1');
    expect(doc.other).to.equal(2);
  });

  it('Should support operators', function* () {
    const collection = yield mongo.collection('test');
    yield collection.insert({ test: 20 });
    const doc = yield collection.findOne({ test: { $gt: 10 } });
    expect(doc).to.be.a('object');
    expect(doc).to.have.keys(['_id', 'test']);
    expect(doc.test).to.equal(20);
  });

  it('Should init with initial data', function* () {
    mongo = new MongoMocker({ test: [], example: [{ object: 1 }, { object: 2 }] });
    expect(mongo.mock.getCollectionData('example')).to.deep.equal([{ object: 1 }, { object: 2 }])
  });
});
