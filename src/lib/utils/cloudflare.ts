import { getUserConfig } from '$lib/db/fileDb';

const CLOUDFLARE_API_URL = 'https://api.cloudflare.com/client/v4/zones';

// Verify if the provided credentials are valid
export async function verifyCredentials(email: string, apiKey: string): Promise<boolean> {
  if (!email || !apiKey) {
    return false;
  }
  
  try {
    const response = await fetch(`${CLOUDFLARE_API_URL}?per_page=1`, {
      method: 'GET',
      headers: {
        'X-Auth-Email': email,
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// Get zones
export async function getZones(): Promise<object[]> {
  const config = await getUserConfig();

  if (!config.email || !config.apiKey) {
    throw new Error('Email and API key are required');
  }
  
  const response = await fetch(`${CLOUDFLARE_API_URL}`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': config.email,
      'Authorization': 'Bearer ' + config.apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.success === true) {
    return data.result;
  }

  return [];
}

// Update record
export async function updateRecord(zoneId: string, recordId: string, query: object): Promise<boolean> {
  const config = await getUserConfig();

  if (!config.email || !config.apiKey) {
    throw new Error('Email and API key are required');
  }

  try {
    const response = await fetch(`${CLOUDFLARE_API_URL}/${zoneId}/dns_records/${recordId}`, {
      method: 'PATCH',
      headers: {
        'X-Auth-Email': config.email,
        'Authorization': 'Bearer ' + config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });
    
    const cloudflareResponse = await response.json();
    return cloudflareResponse;
  } catch (error) {
    throw new Error('Failed to update record: ' + error);
  }
}

// Get records
export async function getRecords(zoneId: string): Promise<object[]> {
  const config = await getUserConfig();

  if (!config.email || !config.apiKey) {
    throw new Error('Email and API key are required');
  }
  
  const response = await fetch(`${CLOUDFLARE_API_URL}/${zoneId}/dns_records?type=A`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': config.email,
      'Authorization': 'Bearer ' + config.apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.success === true) {
    return data.result;
  }

  return [];
}

// Get record IP
export async function getRecordIp(zoneId: string, recordId: string): Promise<string> {
  const config = await getUserConfig();

  if (!config.email || !config.apiKey) {
    throw new Error('Email and API key are required');
  }
  
  const response = await fetch(`${CLOUDFLARE_API_URL}/${zoneId}/dns_records/${recordId}`, {
    method: 'GET',
    headers: {
      'X-Auth-Email': config.email,
      'Authorization': 'Bearer ' + config.apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.success === true) {
    return data.result.content;
  }

  return '';
}