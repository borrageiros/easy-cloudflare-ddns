import { goto } from '$app/navigation';

// Types for API responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

// Type for the login response
export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// Type for the token validation response
export interface TokenValidationResponse {
  valid: boolean;
}

// Type for credential verification response
export interface CredentialsResponse {
  isValid: boolean;
  message?: string;
}

// Type for user configuration
export interface UserConfig {
  email: string;
  apiKey: string;
  checkInterval: number;
  lastIp?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for config response
export interface ConfigResponse {
  success: boolean;
  config: UserConfig;
}

// CloudFlare zone type
export interface CloudFlareZone {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
}

// CloudFlare DNS record type
export interface CloudFlareDnsRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  [key: string]: unknown;
}

// Options for the HTTP request
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  includeAuth?: boolean;
  headers?: Record<string, string>;
}

// Type for DNS Record
export interface DnsRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
}

// Type for Zone
export interface DnsZone {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Type for record response
export interface RecordResponse {
  record: DnsRecord;
}

// Type for records response
export interface RecordsResponse {
  records: DnsRecord[];
}

// Type for zone response
export interface ZoneResponse {
  success: boolean;
  zone: DnsZone;
}

// Type for zones response
export interface ZonesResponse {
  zones: DnsZone[];
}

// Type for server status response
export interface ServerStatusResponse {
  success: boolean;
  externalIp: string;
  lastIp: string;
  nextCheck: number;
  isIntervalPaused: boolean;
  timeParsed: string;
  zonesCount: number;
  recordsCount: number;
}

// Type for toggle interval response
export interface ToggleIntervalResponse {
  success: boolean;
  paused: boolean;
  nextCheck: number;
}

/**
 * Get the status of the server
 * @returns The status of the server
 */
export async function getServerStatus(): Promise<ServerStatusResponse | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ServerStatusResponse;

    if (!data) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error obteniendo configuración de usuario:', error);
    return null;
  }
}

/**
 * Toggle the interval
 * @returns The toggle response
 */
export async function toggleInterval(): Promise<ToggleIntervalResponse | null> {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const response = await fetch('/api/interval/toggle', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    const data = await response.json() as ToggleIntervalResponse;

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error toggling interval:', error);
    return null;
  }
}

/**
 * Force the interval to execute
 * @returns The force response
 */
export async function forceInterval(): Promise<ToggleIntervalResponse | null> {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const response = await fetch('/api/interval/force', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    const data = await response.json() as ToggleIntervalResponse;

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error toggling interval:', error);
    return null;
  }
}

/**
 * Login
 * @param password - The password to login
 * @param rememberSession - Whether to remember the session
 * @returns The login response
 */
export async function login(password: string, rememberSession: boolean = false): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password, rememberSession })
    });
    
    const data = await response.json();
    
    // If the login is successful, save the token
    if (response.ok && data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      success: response.ok,
      token: data.token,
      message: !response.ok ? data.message || data.error : undefined
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      message: 'Connection error'
    };
  }
}

/**
 * Generate Token
 * @param rememberSession - Whether to remember the session
 * @returns The login response
 */
export async function generateToken(rememberSession: boolean = false): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ rememberSession })
    });
    
    const data = await response.json();
    
    // If the login is successful, save the token
    if (response.ok && data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      success: response.ok,
      token: data.token,
      message: !response.ok ? data.message || data.error : undefined
    };
  } catch (error) {
    console.error('Error durante el login:', error);
    return {
      success: false,
      message: 'Error de conexión'
    };
  }
}

/**
 * Logout
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    goto('/login');
  }
}

/**
 * Verify if the user is authenticated (token exists)
 */
export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('authToken');
  }
  return false;
}

/**
 * Validate the token
 * @returns The validation response
 */
export async function validateToken(): Promise<boolean> {
  if (!isAuthenticated()) {
    return false;
  }
  
  try {
    const response = await fetch('/api/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      localStorage.removeItem('authToken');
      return false;
    }
    
    const data = await response.json() as TokenValidationResponse;
    
    if (!data.valid) {
      localStorage.removeItem('authToken');
    }
    
    return data.valid;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Verify CloudFlare credentials
 * @param email - The CloudFlare email
 * @param apiKey - The CloudFlare API key
 * @returns Verification response
 */
export async function verifyCredentials(email: string, apiKey: string): Promise<CredentialsResponse> {
  if (!isAuthenticated()) {
    return { isValid: false, message: 'Not authenticated' };
  }
  
  try {
    const response = await fetch('/api/cloudflare/verify-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ email, apiKey })
    });
    
    if (!response.ok) {
      return { isValid: false, message: 'Server error' };
    }
    
    const data = await response.json();
    
    return {
      isValid: data.success === true,
      message: data.message || data.error
    };
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return { isValid: false, message: 'Connection error' };
  }
}

/**
 * Get user configuration
 * @returns The user config or null if error
 */
export async function getUserConfig(): Promise<UserConfig | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/config', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ApiResponse<UserConfig>;

    if (!data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error obteniendo configuración de usuario:', error);
    return null;
  }
}

/**
 * Create user configuration
 * @param config - The configuration to create
 * @returns The created user config or null if error
 */
export async function createUserConfig(config: {
  email: string;
  apiKey: string;
  checkInterval?: number;
}): Promise<UserConfig | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/config/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ApiResponse<UserConfig>;
    
    if (!data.success || !data.data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error creando configuración de usuario:', error);
    return null;
  }
}

/**
 * Update user configuration
 * @param updates - The configuration updates
 * @returns The updated user config or null if error
 */
export async function updateUserConfig(updates: {
  email?: string;
  apiKey?: string;
  checkInterval?: number;
}): Promise<UserConfig | null> {
  if (!isAuthenticated() || Object.keys(updates).length === 0) {
    return null;
  }
  
  try {
    const response = await fetch('/api/config/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ApiResponse<UserConfig>;
    
    if (!data.success || !data.data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error actualizando configuración de usuario:', error);
    return null;
  }
}

/**
 * Get CloudFlare zones
 * @returns List of zones or null if error
 */
export async function getCloudFlareZones(): Promise<CloudFlareZone[] | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/cloudflare/zones', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ApiResponse<CloudFlareZone[]>;
    
    if (!data.data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error getting CloudFlare zones:', error);
    return null;
  }
}

/**
 * Get DNS records for a zone
 * @param zoneId - The CloudFlare zone ID
 * @returns List of DNS records or null if error
 */
export async function getCloudFlareRecords(zoneId: string): Promise<CloudFlareDnsRecord[] | null> {
  if (!isAuthenticated() || !zoneId) {
    return null;
  }
  
  try {
    const response = await fetch(`/api/cloudflare/records?zoneId=${zoneId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ApiResponse<CloudFlareDnsRecord[]>;
    
    if (!data.data) {
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error getting DNS records:', error);
    return null;
  }
}

/**
 * Get all DNS records
 * @returns List of DNS records or null if error
 */
export async function getRecords(): Promise<DnsRecord[] | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/records/get', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as RecordsResponse;

    if (!data.records) {
      return null;
    }
    
    return data.records;
  } catch (error) {
    console.error('Error getting records:', error);
    return null;
  }
}

/**
 * Create a new DNS record
 * @param record - The record data
 * @returns The created record or null if error
 */
export async function createRecord(record: {
  id: string;
  name: string;
  type: string;
  content: string;
  ttl: number;
  proxied: boolean;
  zoneId: string;
}): Promise<DnsRecord | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/records/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(record)
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as RecordResponse;
    
    if (!data.record) {
      return null;
    }
    
    return data.record;
  } catch (error) {
    console.error('Error creating record:', error);
    return null;
  }
}

/**
 * Update a DNS record
 * @param id - The record ID
 * @param updates - The record updates
 * @returns The updated record or null if error
 */
export async function updateRecord(id: string, updates: {
  name?: string;
  type?: string;
  content?: string;
  ttl?: number;
  proxied?: boolean;
}): Promise<DnsRecord | null> {
  if (!isAuthenticated() || !id || Object.keys(updates).length === 0) {
    return null;
  }
  
  try {
    const response = await fetch(`/api/records/${id}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as RecordResponse;
    
    if (!data.record) {
      return null;
    }
    
    return data.record;
  } catch (error) {
    console.error('Error updating record:', error);
    return null;
  }
}

/**
 * Delete a DNS record
 * @param id - The record ID
 * @returns Success status
 */
export async function deleteRecord(id: string): Promise<boolean> {
  if (!isAuthenticated() || !id) {
    return false;
  }
  
  try {
    const response = await fetch(`/api/records/${id}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    await response.json() as RecordResponse;
    
    return true;
  } catch (error) {
    console.error('Error deleting DNS record:', error);
    return false;
  }
}

// ZONES APIs

/**
 * Get all zones
 * @returns List of zones or null if error
 */
export async function getZones(): Promise<DnsZone[] | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/zones/get', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ZonesResponse;

    if (!data.zones) {
      return null;
    }
    
    return data.zones;
  } catch (error) {
    console.error('Error getting zones:', error);
    return null;
  }
}

/**
 * Create a new zone
 * @param zone - The zone data
 * @returns The created zone or null if error
 */
export async function createZone(zone: {
  id: string;
  name: string;
}): Promise<DnsZone | null> {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    const response = await fetch('/api/zones/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(zone)
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as ZoneResponse;

    if (!data.success || !data.zone) {
      return null;
    }
    
    return data.zone
  } catch (error) {
    console.error('Error creating zone:', error);
    return null;
  }
}

/**
 * Delete a zone
 * @param id - The zone ID
 * @returns Success status
 */
export async function deleteZone(id: string): Promise<boolean> {
  if (!isAuthenticated() || !id) {
    return false;
  }
  
  try {
    const response = await fetch(`/api/zones/${id}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    await response.json() as ApiResponse<ZoneResponse>;
    
    return true;
  } catch (error) {
    console.error('Error deleting zone:', error);
    return false;
  }
} 