# Mongo Mocker

A promise/generator driven Mongo mocking layer, with in memory state and mongo operator support.

#### Install

```bash
npm i mongo-mocker --save-dev
```

#### Requirements

**Node:** 4.3+

#### Setup

```javascript
const MongoMocker = require('./index');
const mongo = new MongoMocker({ 
    users: [
        { _id: 'xxxx1', name: 'Sam' }, 
        { _id: 'xxxx2', name: 'Claire' }, 
        { _id: 'xxxx3', name: 'Dean' }
    ],
    books: [
        { title: 'Willow' }
    ]
});

yield mongo.collection('users').findOne({ name: 'Dean' });
```


#### In Tests

```javascript
const MongoMocker = require('./index');

describe('MongoMocker', () => {
  let mongo;

  before(() => {
    mongo = new MongoMocker({ test: [ { test: -2 } ]});
  });

  afterEach(() => {
    mongo.mock.clearAll();
  });

  it('Inserts and findOne document', function* () {
    const collection = yield mongo.collection('test');
    yield collection.insert({ test: 20 });
    const doc = yield collection.findOne({ test: { $gt: 10 } });
    expect(doc).to.be.a('object');
    expect(doc).to.have.keys(['_id', 'test']);
    expect(doc.test).to.equal(20);
  });

  it('Should init with initial data', function* () {
    mongo = new MongoMocker({ example: [{ object: 1 }, { object: 2 }] });
    expect(mongo.mock.getCollectionData('example')).to.deep.equal([{ object: 1 }, { object: 2 }])
  });
});

```
