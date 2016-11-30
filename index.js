const MongoMocker = require('./src/index');

module.exports = {
  MongoMocker: MongoMocker,
  MockedMongoMocker: (mongoModule, dbData) => {
    const mongoMock = new MongoMocker(dbData);
    if (typeof mongoModule === 'string') {
      require('mock-require')(mongoModule, { db: mongoMock });
    }
    return mongoMock;
  }
};
