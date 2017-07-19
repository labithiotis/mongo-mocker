'use strict';
const util = require('util');
const mongoModifiers = require('./mongoDriver');
const ReadableStream = require('stream').Readable;

function map(fields) {
    const keys = Object.keys(fields);
    const exclude = keys.every(function(key) {
        return fields[key] === -1;
    });
    const include = keys.every(function(key) {
        return !!fields[key] && fields[key] !== -1;
    });
    if (!exclude && !include) {
        throw 'you can either select fields to include, or select fields to exclude';
    }
    return function(doc) {
        const mapped = {};

        if (exclude) {
            keys.forEach(function(key) {
                delete doc[key];
            });
            return doc;
        }

        keys.forEach(function(key) {
            mapped[key] = doc[key];
        });
        return mapped;
    };
}

const Cursor = function(source, query, fields, options) {
    this._fields = fields || {};
    this._source = mongoModifiers(source).find(query, options);
    this.index = 0;
    ReadableStream.call(this, { objectMode: true });
};

util.inherits(Cursor, ReadableStream);

Cursor.prototype._read = function() {
    if (this.index < this._source.length) {
        setTimeout(() => {
            this.push(map(this._fields)(this._source[this.index]));
            this.index++;
        }, 5);
    } else {
        this.push(null);
    }
};

Cursor.prototype.sort = function (comparator) {
  const compareKey = Object.keys(comparator).pop();
  const comparing = comparator[compareKey];
  this._source.sort((a, b) => {
    return a[compareKey] > b[compareKey] ? comparing : (a[compareKey] === b[compareKey] ? 0 : -comparing);
  });
  return this;
};

Cursor.prototype.limit = function (limit) {
  this._source = this._source.slice(0, limit);
  return this;
};

Cursor.prototype.skip = function (skip) {
  this._source = this._source.slice(skip, this._source.length);
  return this;
};

Cursor.prototype.toArray = function() {
    return Promise.resolve(this._source.map(map(this._fields)));
};

Cursor.prototype.batchSize = function() {
  return this;
};

module.exports = Cursor;
