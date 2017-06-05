'use strict';
const bson = require('bson');
const ObjectID = bson.ObjectID;
const modifiers = require('./operators/modifiers');
const allKeysValid = require('./allKeysValid');

function _updateDoc(doc, modifier, wrapped) {
  const isUpdatingWholeDoc = Object.keys(modifier).every(function(key) {
    return !modifiers[key];
  });

  if (isUpdatingWholeDoc) {
    const index = wrapped._data.indexOf(doc);
    wrapped._data[index] = doc;
    return;
  }

  Object.keys(modifier).forEach(function(key) {
    if (!modifiers[key]) {
      throw 'this modifier is not supported for now or invalid: ' + key;
    } else {
      const modifierValue = modifier[key];
      const modifiedDoc = modifiers[key](doc, modifierValue);
      const index = wrapped._data.indexOf(doc);
      wrapped._data[index] = modifiedDoc;
    }
  });
}

module.exports = class MongoDriver {
  constructor(array) {
    this._data = array;
  }

  find(query, options) {
    options = options || {};

    let filteredArray = this._data.filter((item) => allKeysValid(query, item));

    if (options.skip) {
      filteredArray = filteredArray.slice(options.skip, filteredArray.length);
    }

    if (options.limit) {
      filteredArray.length = options.limit;
    }

    return filteredArray;
  }

  findOne(query) {
    for (let i = 0; i < this._data.length; i++) {
      if (allKeysValid(query, this._data[i])) {
        return this._data[i];
      }
    }
  }

  update(query, modifier, options) {
    let counter = 0;
    options = options || {};

    if (options.multi) {
      const docs = this.find(query, {});
      docs.forEach((doc) => {
        _updateDoc(doc, modifier, this);
        counter++;
      });
    } else {
      const doc = this.findOne(query);
      if (doc) {
        counter++;
        _updateDoc(doc, modifier, this);
      }
    }

    if (counter === 0 && options.upsert) {
      if (modifier.$set) {
        counter++;
        this.insert(modifier.$set);
      }
    }

    return counter;
  }

  insert(doc) {
    const docs = [].concat(JSON.parse(JSON.stringify(doc)));
    docs.forEach((doc) => {
      if (!doc._id || !(doc._id instanceof ObjectID)) {
        doc._id = new bson.ObjectId();
      }
      this._data.push(doc);
    });
    return doc;
  }

  remove(query) {
    const self = this;
    const docs = this.find(query);

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const index = self._data.indexOf(doc);

      if (index !== -1) {
        self._data.splice(index, 1);
      }
    }
  }

  findAndModify(query, modifier, options) {
    options = options || {};
    let doc = this.findOne(query);
    if (doc) {
      if (options.new) {
        _updateDoc(doc, modifier, this);
      }
      else {
        _updateDoc(JSON.parse(JSON.stringify(doc)), modifier, this);
      }
    } else if (!modifier.$set && options.upsert) {
      doc = this.insert(modifier);
    }
    return doc;
  }
};
