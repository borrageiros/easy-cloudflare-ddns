const { getConfig, checkConfig, updateLastIp } = require("./user-config");
const { findDocuments } = require("../database/db");
const { updateRecord } = require("./cloudflare-api");
const getExternalIP = require("./get-external-ip");

function getRecords() {
  return new Promise((resolve, reject) => {
    findDocuments({ type: "record" }, (err, records) => {
      if (!err && records) {
        resolve(records);
      } else {
        resolve({});
      }
    });
  });
}

async function executeUpdater() {
  startTime = Date.now();
  const date = new Date(startTime * 1000);
  const records = await getRecords();
  console.log(`🔁 Checking IP at:\n ${date}\n Next check in ${intervalTime / 1000} seconds`);

  const config = await getConfig();
  const externalIp = await getExternalIP();
  
  if ( !config.lastIp || config.lastIp != externalIp ) {
    if ( records.length > 0 ) {
      records.forEach((record) => {
        try {
          updateRecord(record.zoneId, record.recordId, { content: externalIp, proxied: record.proxy, ttl: record.ttl })
        } catch (error) {
          console.log(error)
        }
      });
      console.log("✅ Records updated successfully");
    }
    updateLastIp(externalIp);
  }

  console.log("");
}

let intervalTime;

async function initializeInterval() {
  const initialInterval = await getInterval();
  intervalTime = initialInterval ? (initialInterval * 60 * 1000) : (5 * 60 * 1000);
  console.log(`🔁 Interval time initialized to ${intervalTime / 1000} seconds`);

  await executeUpdater();

  if (intervalTime !== undefined) {
    startInterval();
  }
}

initializeInterval().catch((error) => {
  console.error('Error initializing interval:', error);
});

async function getInterval() {
  const configExist = await checkConfig();
  if (configExist) {
    const config = await getConfig();
    return config.checkInterval;
  }
  return null;
}

let intervalId;
let startTime;
let remainingTime;

function startInterval() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (intervalTime !== undefined) {
    startTime = Date.now();
    intervalId = setInterval(() => {
      executeUpdater();
    }, intervalTime);
  }
}

function stopInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function updateInterval(newInterval) {
    intervalTime = newInterval * 60 * 1000;
    console.log(" ❕Check updated - Next check in " + newInterval * 60 + " seconds");
    console.log("");
    startInterval();
}

function getRemainingTime() {
    if (intervalId) {
        const elapsedTime = Date.now() - startTime;
        remainingTime = intervalTime - elapsedTime;
    } else {
        remainingTime = 0;
    }
    return remainingTime;
}

module.exports = {
    startInterval,
    stopInterval,
    updateInterval,
    getRemainingTime,
    executeUpdater
};
