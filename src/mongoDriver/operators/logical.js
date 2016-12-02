'use strict';
const allKeysValid = require('./../allKeysValid');

module.exprots = {
  $or: function(doc, array) {
    return array.some(function(condition) {
      return allKeysValid(condition, doc);
    });
  },
  $and: function(doc, array) {
    return array.every(function(condition) {
      return allKeysValid(condition, doc);
    });
  },
  $not: function(doc, condition) {
    return !allKeysValid(condition, doc);
  },
  $nor: function(doc, array) {
    return !this.$and(doc, array);
  }
};
