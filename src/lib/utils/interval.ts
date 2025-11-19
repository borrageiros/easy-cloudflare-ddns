import { getRecords, getUserConfig, updateUserConfig, updateRecord as updateRecordFileDb } from "$lib/db/fileDb";
import { getServerExternalIp, setIpCacheExpiration, invalidateIpCache } from "./server-ip";
import { updateRecord as updateRecordCloudflare } from "./cloudflare";

let intervalId: ReturnType<typeof setInterval> | null = null;
let isPaused = false;
let nextCheckTime = 0;
let intervalSeconds = 300;

async function executeTask() {
  // Invalidate the IP cache to force a real check when the interval is up
  invalidateIpCache();
  const externalIp = await getServerExternalIp();
  const config = await getUserConfig();

  // Check if the interval has changed
  if (config?.checkInterval && config.checkInterval !== intervalSeconds) {
    const newIntervalSeconds = config.checkInterval;
    startInterval(newIntervalSeconds);
  }

  if (config.lastIp !== externalIp) {

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
  
  // Synchronize IP cache expiration with the check interval
  setIpCacheExpiration(intervalSeconds);
  
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
  
  // Update IP cache expiration to match the interval
  setIpCacheExpiration(seconds);
  
  intervalId = setInterval(() => {
    if (!isPaused) {
      executeTask();
      nextCheckTime = Date.now() + milliseconds;
    }
  }, milliseconds);
}

export function forceExecution() {
  if (intervalId) {
    // Invalidate the IP cache to force a real check on manual execution
    invalidateIpCache();
    executeTask();
    
    if (!isPaused) {
      const milliseconds = intervalSeconds * 1000;
      nextCheckTime = Date.now() + milliseconds;
      
      return true;
    } else {
      return true;
    }
  }
  return false;
}

export function pauseInterval() {
  if (!isPaused && intervalId) {
    isPaused = true;
    return true;
  }
  return false;
}

export function resumeInterval() {
  if (isPaused && intervalId) {
    isPaused = false;
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

export async function forceCloudflareUpdate(): Promise<boolean> {
  try {
    const externalIp = await getServerExternalIp();
    const records = await getRecords();
    
    if (records.length === 0) {
      return false;
    }
    
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
    
    const config = await getUserConfig();
    config.lastIp = externalIp;
    await updateUserConfig(config);
    
    return true;
  } catch (error) {
    console.error('Error forcing Cloudflare update:', error);
    return false;
  }
}