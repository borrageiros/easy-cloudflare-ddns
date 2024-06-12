const { findDocuments, updateDocument } = require('../database/db');

// Return true or false
function checkConfig() {
  return new Promise((resolve, reject) => {
    findDocuments({ type: "config" }, (err, config) => {
      if (!err && config[0]) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

function getConfig() {
  return new Promise((resolve, reject) => {
    findDocuments({ type: "config" }, (err, config) => {
      if (!err && config[0]) {
        resolve(config[0]);
      } else {
        resolve({});
      }
    });
  });
}

function updateLastIp(ip) {
  updateDocument({ type: "config" }, { $set: { lastIp: ip} }, { multi: false }, (err, numAffected, affectedDocuments, upsert) => {});
}

module.exports = {
  checkConfig,
  getConfig,
  updateLastIp
};
