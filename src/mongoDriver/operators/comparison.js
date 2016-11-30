const utils = require('./../utils');
const allKeysValid = require('./../allKeysValid');

const comparisonOperators = {
  _bsontype: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return (property !== undefined) === value;
  },
  $gt: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return property > value;
  },
  $gte: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return property >= value;
  },
  $lt: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return property < value;
  },
  $lte: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return property <= value;
  },
  $in: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    if (!(Array.isArray(value))) {
      throw new Error('Should set an array for $in call');
    }
    if (Array.isArray(property)) {
      return property.some(function(docFieldItem) {
        return value.some(function(valueFieldItem) {
          return docFieldItem == valueFieldItem;
        });
      });
    }
    else {
      return value.some(function(valueItem) {
        return property == valueItem;
      });
    }
  },
  $nin: (doc, field, value) => {
    return !this.$in(doc, field, value);
  },
  $regex: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return value.test(property);
  },
  $ne: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return property != value;
  },
  $exists: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    return (property !== undefined) === value; //null values does not include
  },
  $size: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    if (property && property.length) {
      return property.length === value;
    }
    return false;
  },
  $all: (doc, field, value) => {
    const property = utils.prop(field)(doc);
    if (property) {
      return value.every(function(valueItem) {
        property.some(function(docFieldItem) {
          docFieldItem == valueItem;
        });
      });
    }
    return false;
  },
  $elemMatch: (doc, field, condition) => {
    const property = utils.prop(field)(doc);
    if (property) {
      return property.some(function(element) {
        return allKeysValid(condition, element);
      });
    }
    return false;
  }
};

module.exports = comparisonOperators;
