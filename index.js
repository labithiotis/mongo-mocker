const MongoMocker = require('./src/index');

module.exports = function() {
  const mockModulePath = typeof arguments[0] === 'string' ? arguments[0] : null;
  const mongoMock = new MongoMocker(mockModulePath ? arguments[1] : arguments[0]);
  if (mockModulePath) {
    require('mock-require')(mockModulePath, { db: mongoMock });
  }
  return mongoMock;
};
