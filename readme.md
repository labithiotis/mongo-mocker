# Mongo Mocker

A promise/generator driven Mongo mocking layer, with in memory state and mongo operator support.

### Install

```bash
npm i mongo-mocker --save-dev
```

#### Requirements

**Node:** 6+

### Setup

#### MongoMocker([mockModulePath], initialCollections)

```javascript
const MongoMocker = require('mongo-mocker');
const mongo = MongoMocker('module/path/for/mongo/driver', { 
    users: [
        { _id: 'xxxx1', name: 'Sam' }, 
        { _id: 'xxxx2', name: 'Claire' }, 
        { _id: 'xxxx3', name: 'Dean' }
    ],
    books: [
        { title: 'Willow' }
    ]
});

/** <==≠ OR ≠===========================> **/

const mongo = require('mongo-mocker')('module/path/for/mongo/driver', {});

/** <==≠ OR (just the mongoDB) ≠========> **/

const mongo = require('mongo-mocker')();

```

In src code all normal operations happen and work as expected
```javascript
yield mongo.collection('users').findOne({ name: 'Dean' });
// { _id: 'xxxx3', name: 'Dean' }
```

#### Helpers
```javascript
const mongo = MongoMocker({ users: { _id: '1', name: 'Sam' }, test: [] });

mongo.mock.getCollectionData('users');
// Returns internal state of users collects: [{ _id: '1', name: 'Sam' }]

mongo.mock.clear('test');
// Clear a specific collection

mongo.mock.clarAll();
// Clears all collections
```

#### In Tests

```javascript
const MongoMocker = require('./index');

describe('MongoMocker', () => {
  let mongo;

  before(() => {
    mongo = new MongoMocker('mongoDriver/path', { test: [ { test: -2 } ]});
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
