const _ = require('lodash');

function prop(name) {
  const propertiesArray = name.split('.');
  return function(object) {
    if (!object) {
      return;
    }
    let property = object;
    for (let i = 0; i < propertiesArray.length; i++) {
      if (typeof propertiesArray[i + 1] === 'number' && propertiesArray[i] instanceof Array) {
        property = property[propertiesArray[i]][propertiesArray[i + 1]];
        i++;
      } else {
        property = property[propertiesArray[i]];

        if (typeof(property) === 'undefined') {
          return;
        }

        if (property === null) {
          if (i + 1 === propertiesArray.length) {
            return null;
          } else {
            return;
          }
        }
      }
    }
    return property;
  };
}

function deepClone(object) {
  return JSON.parse(JSON.stringify(object));
}

function addPropIfNotExist(obj, prop, value) {
  if (obj instanceof Object && !(prop in obj)) {
    obj[prop] = value;
  }
  return obj;
}

function renameProp(obj, oldProp, newProp) {
  const oldPropertyValue = prop(oldProp)(obj);
  _.set(obj, newProp, oldPropertyValue);
  deleteProp(oldProp)(obj);
  return obj;
}

function deleteProp(obj, oldProp) {
  _.set(obj, oldProp, void 0);
  return obj;
}

function addArrayItemsPropIfNotExist(arr, prop, value) {
  if (arr instanceof Array) {
    arr.forEach(function(item) {
      addPropIfNotExist(item, prop, value);
    });
  }
  return arr;
}

function renameArrayItemsProp(arr, oldProp, newProp) {
  if (arr instanceof Array) {
    arr.forEach(function(item) {
      renameProp(item, oldProp, newProp);
    });
  }
  return arr;
}

function deleteArrayItemsProp(arr, oldProp) {
  if (arr instanceof Array) {
    arr.forEach(function(item) {
      deleteProp(item, oldProp);
    });
  }
  return arr;
}

module.exports = {
  prop: prop,
  deepClone: deepClone,
  deleteProp: deleteProp,
  renameProp: renameProp,
  addPropIfNotExist: addPropIfNotExist,
  renameArrayItemsProp: renameArrayItemsProp,
  deleteArrayItemsProp: deleteArrayItemsProp,
  addArrayItemsPropIfNotExist: addArrayItemsPropIfNotExist
};
