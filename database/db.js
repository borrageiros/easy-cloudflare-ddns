const Datastore = require('nedb');

const db = new Datastore({ filename: "./database/data/data.db", autoload: true });

function insertDocument(data, callback) {
    db.insert(data, (err, newDoc) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, newDoc);
        }
    });
};

function findDocuments(query, callback) {
    db.find(query, (err, docs) => {
        if (!err) {
            callback(null, docs);
        } else {
            console.error(err);
            callback(err, null);
        }
    });
};

function updateDocument(query, update, options, callback) {
    db.update(query, update, options, (err, numAffected, affectedDocuments, upsert) => {
        if (!err) {
            callback(null, numAffected, affectedDocuments, upsert);
        } else {
            console.error(err);
            callback(err, null);
        }
    });
};

function removeDocument(query, options, callback) {
    db.remove(query, options, (err, numRemoved) => {
        if (!err) {
            callback(null, numRemoved);
        } else {
            console.error(err);
            callback(err, null);
        }
    });
};

function countDocuments(query, callback) {
    db.count(query, (err, count) => {
        if (!err) {
            callback(null, count);
        } else {
            console.error(err);
            callback(err, null);
        }
    });
};

module.exports = {
    insertDocument,
    findDocuments,
    updateDocument,
    removeDocument,
    countDocuments
};