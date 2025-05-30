/**
 * Cache system for external IP
 */
interface IpCache {
  value: string | null;
  timestamp: number;
  expiresIn: number; // milliseconds
}

// Initialize the cache
const ipCache: IpCache = {
  value: null,
  timestamp: 0,
  expiresIn: 5 * 60 * 1000 // Default: 5 minutes
};

/**
 * Get the external IP address of the server
 * This function is intended to be called from the server-side API endpoints
 * @returns Promise with the external IP address as a string
 */
export async function getServerExternalIp(): Promise<string> {
  // Check if we have a valid cached value
  const now = Date.now();
  if (ipCache.value && (now - ipCache.timestamp) < ipCache.expiresIn) {
    return ipCache.value;
  }

  try {
    // Try multiple IP lookup services for redundancy
    const services = [
      'https://api.ipify.org',
      'https://icanhazip.com',
      'https://ifconfig.me/ip',
      'https://api.ipify.org?format=json'
    ];
    
    // Try each service until one succeeds
    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'User-Agent': 'curl/7.74.0',
            'Accept': 'text/plain, application/json'
          }
        });
        
        if (!response.ok) {
          continue;
        }
        
        // Handle both plain text and JSON responses
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          const data = await response.json();
          // Different services might have different response formats
          const ip = data.ip || data.ipAddress || data.address;
          if (ip && typeof ip === 'string' && isValidIp(ip)) {
            // Update cache
            ipCache.value = ip.trim();
            ipCache.timestamp = now;
            return ipCache.value;
          }
        } else {
          const ip = await response.text();
          if (isValidIp(ip)) {
            // Update cache
            ipCache.value = ip.trim();
            ipCache.timestamp = now;
            return ipCache.value;
          }
        }
      } catch (innerError) {
        console.error(`Error fetching IP from ${service}:`, innerError);
        // Continue to the next service if one fails
      }
    }
    
    // If all services fail, throw an error
    throw new Error('Failed to obtain external IP from any service');
  } catch (error) {
    console.error('Error getting server external IP:', error);
    throw new Error('Failed to determine server external IP');
  }
}

/**
 * Manually invalidate the IP cache to force a refresh on next call
 */
export function invalidateIpCache(): void {
  ipCache.value = null;
  ipCache.timestamp = 0;
}

/**
 * Update the cache expiration time
 * @param seconds - The cache expiration time in seconds
 */
export function setIpCacheExpiration(seconds: number): void {
  if (seconds > 0) {
    ipCache.expiresIn = seconds * 1000;
  }
}

/**
 * Check if a string is a valid IPv4 or IPv6 address
 * @param ip - The IP address to validate
 * @returns true if the IP is valid
 */
function isValidIp(ip: string): boolean {
  // Basic validation for IPv4
  ip = ip.trim();
  
  // IPv4 regex pattern
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (ipv4Pattern.test(ip)) {
    // Check each octet is between 0-255
    return ip.split('.').map(Number).every(octet => octet >= 0 && octet <= 255);
  }
  
  // Basic IPv6 validation - should be good enough for our purposes
  // Full IPv6 validation is complex due to many valid formats
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
  return ipv6Pattern.test(ip);
}
