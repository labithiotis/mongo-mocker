'use strict';
const Collection = require('./Collection');

module.exports = class MongoMocker {
  constructor(collections) {
    this.collections = {};

    for (let collection in collections || {}) {
      if (!(collections[collection] instanceof Array)) {
        throw `${collection} collection should be an array`;
      }
      this.collections[collection] = new Collection(collections[collection]);
    }

    this.mock = {
      clear: (collection) => collection && this.collections[collection].drop(),
      clearAll: () => {
        for (let collection in this.collections) {
          this.mock.clear(collection);
        }
      },
      getCollectionData: (collection) => {
        return this.collections[collection] ? this.collections[collection]._data : undefined
      }
    }
  }

  collection(collection) {
    this.collections[collection] = this.collections[collection] || new Collection([]);
    return Promise.resolve(this.collections[collection]);
  }

  ensureIndex(collection, index) {
    return Promise.resolve(index);
  }
};
