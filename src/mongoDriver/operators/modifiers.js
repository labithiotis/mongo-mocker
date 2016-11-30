const _ = require('lodash');
const MongoDriver = require('./../MongoDriver');
const utils = require('./../utils');

const checkArrayPresence = function(doc, key, modifier) {
  const filtered = doc[key].filter((item) => item == modifier[key]);
  return filtered.length > 0;
};

module.exports = {
  $set: function(doc, modifier) {
    _.keys(modifier).forEach((key) => _.set(doc, key, modifier[key]));
    return doc;
  },
  $unset: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      utils.deleteProp(doc, key);
    });
    return doc;
  },
  $addToSet: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      const docProperty = utils.prop(key)(doc);
      if (!(docProperty instanceof Array)) {
        throw new Error(`$addToSet called on non array property ${key}`);
      }
      let isPresent;
      const modifierProperty = modifier[key];

      if (modifierProperty.$each && modifierProperty.$each instanceof Array) {
        modifierProperty.$each.forEach(function(modifierItem) {

          const mod = {};
          _.set(mod, key, modifierItem);
          isPresent = checkArrayPresence(doc, key, mod);

          if (!isPresent) {
            docProperty.push(modifierItem);
          }
        });
      }
      else {
        isPresent = checkArrayPresence(doc, key, modifier);
        if (!isPresent) {
          docProperty.push(modifierProperty);
        }
      }
    });
    return doc;
  },
  $inc: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      doc[key] = doc[key] || 0;
      doc[key] += modifier[key];
    });
    return doc;
  },
  $rename: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      const newPropertyKey = utils.prop(key)(modifier);
      utils.renameProp(doc, key, newPropertyKey);
    });
    return doc;
  },
  $pop: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      const property = utils.prop(key)(doc);
      const modifierValue = modifier[key];

      if (!(property instanceof Array)) {
        throw new Error(`Property ${key} is not array`);
      }

      if (modifierValue == 1) {
        property.pop();
      }

      else if (modifierValue == -1) {
        property.shift();
      }
    });

    return doc;
  },
  $push: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      const property = utils.prop(key)(doc);
      const modifierProperty = modifier[key];

      if (!(property instanceof Array)) {
        throw new Error(`Property ${key} is not array`);
      }

      if (modifierProperty.$each && modifierProperty.$each instanceof Array) {
        modifierProperty.$each.forEach(function(modifierItem) {
          property.push(modifierItem);
        });
      }
      else {
        property.push(modifierProperty);
      }
    });

    return doc;
  },
  $pull: function(doc, modifier) {
    Object.keys(modifier).forEach(function(key) {
      const property = utils.prop(key)(doc);
      const modifierProperty = modifier[key];

      if (!(property instanceof Array)) {
        throw new Error(`Property ${key} is not array`);
      }

      const subCollection = new MongoDriver(property.slice());
      subCollection.remove(modifierProperty); //todo: UGLY AS SHIT
      _.set(doc, key, subCollection._data);
    });

    return doc;
  }
};
