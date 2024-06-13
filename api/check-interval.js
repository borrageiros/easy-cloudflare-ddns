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
  const date = new Date(startTime);
  const records = await getRecords();
  console.log(`🔁 Checking IP at:\n ${date}\n Next check in ${intervalTime / 1000} seconds`);

  const config = await getConfig();
  const externalIp = await getExternalIP();
  
  if (!config.lastIp || config.lastIp != externalIp) {
    if (records.length > 0) {
      records.forEach((record) => {
        try {
          updateRecord(record.zoneId, record.recordId, { content: externalIp, proxied: record.proxy, ttl: record.ttl });
        } catch (error) {
          console.log(error);
        }
      });
      console.log("✅ Records updated successfully");
      console.log("");
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
  console.log("");

  await executeUpdater();

  if (intervalTime !== undefined) {
    startInterval();
  }
}

initializeInterval().catch((error) => {
  console.error('Error initializing interval:', error);
  console.log("");
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
let paused = false;
let pauseStart;

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

function getIsPaused() {
  return paused;
}

function pauseInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    paused = true;
    pauseStart = Date.now();
    remainingTime = intervalTime - (pauseStart - startTime);
    console.log(`⏸️ Interval paused. Time remaining: ${remainingTime / 1000} seconds`);
    console.log("");
  }
}

function resumeInterval() {
  if (paused) {
    paused = false;
    startTime = Date.now();
    intervalId = setTimeout(() => {
      executeUpdater();
      startInterval();
    }, remainingTime);
    console.log(`▶️ Interval resumed. Time until next check: ${remainingTime / 1000} seconds`);
    console.log("");
  }
}

function updateInterval(newInterval) {
  intervalTime = newInterval * 60 * 1000;
  console.log("❕Check updated - Next check in " + newInterval * 60 + " seconds");
  console.log("");
  startInterval();
}

function getRemainingTime() {
  if (paused) {
    return remainingTime;
  }
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
  getIsPaused,
  pauseInterval,
  resumeInterval,
  updateInterval,
  getRemainingTime,
  executeUpdater
};
