import { getRecords, getUserConfig, updateUserConfig, updateRecord as updateRecordFileDb } from "$lib/db/fileDb";
import { getServerExternalIp } from "./server-ip";
import { updateRecord as updateRecordCloudflare } from "./cloudflare";

let intervalId: ReturnType<typeof setInterval> | null = null;
let isPaused = false;
let nextCheckTime = 0;
let intervalSeconds = 300;

async function executeTask() {
  const externalIp = await getServerExternalIp();
  const config = await getUserConfig();

  // Check if the interval has changed
  if (config?.checkInterval && config.checkInterval !== intervalSeconds) {
    const newIntervalSeconds = config.checkInterval;
    startInterval(newIntervalSeconds);
  }

  if (config.lastIp !== externalIp) {
    console.log(`IP changed from ${config.lastIp} to ${externalIp}`);

    const records = await getRecords();
    for (const record of records) {
      await updateRecordCloudflare(
        record.zoneId,
        record.id,
        {
          name: record.name,
          type: record.type,
          content: externalIp,
          proxied: record.proxied,
          ttl: record.ttl
        }
      );
      await updateRecordFileDb(record.id, { content: externalIp });
    }

    config.lastIp = externalIp;
    await updateUserConfig(config);
  }
}

export async function initializeInterval() {
  const config = await getUserConfig();
  intervalSeconds = config?.checkInterval || 300;
  
  startInterval(intervalSeconds);
  
  return {
    intervalSeconds
  };
}

function startInterval(seconds: number) {
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  intervalSeconds = seconds;
  const milliseconds = seconds * 1000;
  nextCheckTime = Date.now() + milliseconds;
  
  intervalId = setInterval(() => {
    if (!isPaused) {
      executeTask();
      nextCheckTime = Date.now() + milliseconds;
    }
  }, milliseconds);
  
  console.log(`Interval started with ${seconds} seconds`);
}

export function forceExecution() {
  if (intervalId) {
    executeTask();
    
    if (!isPaused) {
      const milliseconds = intervalSeconds * 1000;
      nextCheckTime = Date.now() + milliseconds;
      
      console.log(`Task forced execution. Next check in ${intervalSeconds} seconds`);
      return true;
    } else {
      console.log("Task forced execution (interval remains paused)");
      return true;
    }
  }
  return false;
}

export function pauseInterval() {
  if (!isPaused && intervalId) {
    isPaused = true;
    console.log("Interval paused");
    return true;
  }
  return false;
}

export function resumeInterval() {
  if (isPaused && intervalId) {
    isPaused = false;
    console.log("Interval resumed");
    return true;
  }
  return false;
}

export async function getIntervalStatus() {
  const config = await getUserConfig();
  return {
    lastIp: config?.lastIp || 'No last IP found',
    isPaused,
    externalIp: await getServerExternalIp(),
    nextCheck: getSecondsUntilnextCheck()
  };
}

export function getSecondsUntilnextCheck(): number {
  if (!intervalId || isPaused) {
    return -1;
  }
  
  const remainingMilliseconds = Math.max(0, nextCheckTime - Date.now());
  return Math.ceil(remainingMilliseconds / 1000);
}