const getIP = require('external-ip')();

async function getExternalIP() {
  return new Promise((resolve, reject) => {
    getIP((err, ip) => {
      if (err) {
          throw err;
      }
      resolve(ip);
  });
  });
}

module.exports = getExternalIP;