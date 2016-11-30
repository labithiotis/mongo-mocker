const bson = require('bson');
const ObjectID = bson.ObjectID;
const logicalOperators = require('./operators/logical');
const comparisonOperators = require('./operators/comparison');

function areEqual(field1, field2) {
  if (field1 instanceof ObjectID) {
    return field1.toString() === field2.toString();
  }
  return field1 == field2;
}

function allKeysValid(query, item) {
  if (typeof query !== 'object') {
    return query === item;
  }

  if (!query || !item) {
    return false;
  }

  function anyMatchOf(key, pathStep, item) {
    return item[pathStep].some(function(subArrayItem) {
      const subQueryKey = key.replace(new RegExp(pathStep + '\\.'), '');
      const subQuery = {};
      subQuery[subQueryKey] = query[key];

      return allKeysValid(subQuery, subArrayItem);
    });
  }

  return Object.keys(query).every(function(key) {
    if (query[key] instanceof ObjectID) {
      return areEqual(query[key], item[key]);
    } else if (logicalOperators[key]) {
      return logicalOperators[key](item, query[key]);
    } else if (typeof query[key] == 'object') {
      return Object.keys(query[key]).every(function(operator) {
        if (!comparisonOperators[operator]) {
          throw new Error(`${operator} not supported by MongoMocker`);
        }
        return comparisonOperators[operator](item, key, query[key][operator]);
      });
    } else if (typeof key === 'string' && new RegExp('.*\\..*').test(key)) {
      const properties = key.split('.');
      const path = [];

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        path.push(property);
        const pathStep = path.join('.');
        if (item[pathStep] instanceof Array) {
          const nextOperator = parseInt(properties[i + 1]);
          if (!isNaN(nextOperator)) {

            const subQueryKey = key.replace(new RegExp(pathStep + '\\.' + properties[i + 1] + '\\.'), '');
            const subQuery = {};
            subQuery[subQueryKey] = query[key];
            const subArrayItem = item[pathStep][properties[i + 1]];

            return allKeysValid(subQuery, subArrayItem);
          } else {
            return anyMatchOf(key, pathStep, item);
          }
        }
      }
    }

    return areEqual(query[key], item[key]);
  });
}

module.exports = allKeysValid;
