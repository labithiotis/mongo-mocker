'use strict';
const Cursor = require('./Cursor');
const utils = require('./mongoDriver/utils');
const _ = require('./mongoDriver');

module.exports = class Collection {
    constructor(docs) {
        this._data = utils.deepClone(docs);
        this._initailData = utils.deepClone(docs);
    }

    find(query, fields, options) {
        query = query || {};
        return new Cursor(this._data.slice(), query, fields, options);
    }

    save(doc, options) {
        options = options || { upsert: true };
        if (doc._id) {
            return this.update({ _id: doc._id }, doc, options);
        } else {
            return this.insert(doc);
        }
    }

    findOne(query) {
        return Promise.resolve(_(this._data).findOne(query));
    }

    count(query, options) {
        options = options || {};
        return Promise.resolve(_(this._data).find(query, options).length);
    }

    toArray() {
        return Promise.resolve(this._data.slice());
    }

    insert(doc) {
        _(this._data).insert(doc);
        return Promise.resolve(doc);
    }

    update(query, modifier, options) {
        options = options || {};

        if (modifier.$set && modifier.$set._id) {
            delete modifier.$set._id;
        }

        const counter = _(this._data).update(query, modifier, options);
        return Promise.resolve(counter);
    }

    updateOne(query, modifier, options) {
        options = options || {};
        options.multi = false;
        return this.update(query, modifier, options);
    }

    deleteOne(query) {
        _(this._data).removeOne(query);
        return Promise.resolve();
    }

    remove(query) {
        _(this._data).remove(query);
        return Promise.resolve();
    }

    findAndModify(query, sort, modifier, options) {
        options = options || {};

        if (modifier.$set && modifier.$set._id) {
            delete modifier.$set._id;
        }

        const doc = _(this._data).findAndModify(query, modifier, options);
        return Promise.resolve(doc);
    }

    drop() {
      this._data = [];
      return Promise.resolve();
    }
};
