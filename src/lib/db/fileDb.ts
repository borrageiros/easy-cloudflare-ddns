import fs from 'fs';
import path from 'path';

export interface UserConfig {
  email: string;
  apiKey: string;
  checkInterval: number;
  lastIp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Record {
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

export interface Zone {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  configuration: UserConfig;
  records: Record[];
  zones: Zone[];
  [collection: string]: unknown;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

function ensureDbDirExists() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getDefaultDatabase(): Database {
  return {
    configuration: getDefaultConfig(),
    records: [],
    zones: []
  };
}

function getDefaultConfig(): UserConfig {
  return {
    email: '',
    apiKey: '',
    checkInterval: 300, // 5 minutes in seconds
    lastIp: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function readDatabase(): Promise<Database> {
  ensureDbDirExists();
  
  try {
    if (!fs.existsSync(DB_FILE)) {
      const defaultDb = getDefaultDatabase();
      await fs.promises.writeFile(
        DB_FILE,
        JSON.stringify(defaultDb, null, 2),
        'utf8'
      );
      return defaultDb;
    }
    
    const data = await fs.promises.readFile(DB_FILE, 'utf8');
    return JSON.parse(data) as Database;
  } catch (error) {
    console.error('Error reading database:', error);
    return getDefaultDatabase();
  }
}

async function writeDatabase(db: Database): Promise<void> {
  ensureDbDirExists();
  
  try {
    await fs.promises.writeFile(
      DB_FILE,
      JSON.stringify(db, null, 2),
      'utf8'
    );
  } catch (error) {
    console.error('Error writing database:', error);
    throw new Error('Failed to write to database');
  }
}

export async function getUserConfig(): Promise<UserConfig> {
  const db = await readDatabase();
  return db.configuration || getDefaultConfig();
}

export async function createUserConfig(config: Partial<UserConfig>): Promise<UserConfig> {
  try {
    const db = await readDatabase();
    const now = new Date().toISOString();
    
    const newConfig: UserConfig = {
      ...getDefaultConfig(),
      ...config,
      createdAt: now,
      updatedAt: now
    };
    
    db.configuration = newConfig;
    await writeDatabase(db);
    
    return newConfig;
  } catch (error) {
    console.error('Error creating user config:', error);
    throw new Error('Failed to create user configuration');
  }
}

export async function updateUserConfig(updates: Partial<UserConfig>): Promise<UserConfig> {
  try {
    const db = await readDatabase();
    const currentConfig = db.configuration || getDefaultConfig();
    
    const updatedConfig: UserConfig = {
      ...currentConfig,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    db.configuration = updatedConfig;
    await writeDatabase(db);
    
    return updatedConfig;
  } catch (error) {
    console.error('Error updating user config:', error);
    throw new Error('Failed to update user configuration');
  }
}

// Funciones genéricas para trabajar con cualquier colección

export async function getCollection<T>(collectionName: string): Promise<T | null> {
  const db = await readDatabase();
  return (db[collectionName] as T) || null;
}

export async function setCollection<T>(collectionName: string, data: T): Promise<T> {
  const db = await readDatabase();
  db[collectionName] = data;
  await writeDatabase(db);
  return data;
}

export async function updateCollection<T>(
  collectionName: string, 
  updateFn: (currentData: T | null) => T
): Promise<T> {
  const db = await readDatabase();
  const currentData = db[collectionName] as T | null;
  const updatedData = updateFn(currentData);
  
  db[collectionName] = updatedData;
  await writeDatabase(db);
  
  return updatedData;
}

// Record specific functions
export async function getRecords(): Promise<Record[]> {
  const db = await readDatabase();
  return db.records || [];
}

export async function createRecord(record: Omit<Record, 'createdAt' | 'updatedAt'>): Promise<Record> {
  try {
    const db = await readDatabase();
    const now = new Date().toISOString();

    if (db.records.find(r => r.id === record.id)) {
      throw new Error('Record already exists');
    }
    
    const newRecord: Record = {
      ...record,
      createdAt: now,
      updatedAt: now
    };
    
    db.records = [...(db.records || []), newRecord];
    
    await writeDatabase(db);
    
    return newRecord;
  } catch (error) {
    console.error('Error creating record:', error);
    throw new Error('Failed to create record');
  }
}

export async function updateRecord(id: string, updates: Partial<Omit<Record, 'createdAt' | 'updatedAt'>>): Promise<Record | null> {
  try {
    const db = await readDatabase();
    const records = db.records || [];
    const recordIndex = records.findIndex(r => r.id === id);
    
    if (recordIndex === -1) {
      return null;
    }
    
    const updatedRecord: Record = {
      ...records[recordIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    records[recordIndex] = updatedRecord;
    db.records = records;
    await writeDatabase(db);
    
    return updatedRecord;
  } catch (error) {
    console.error('Error updating record:', error);
    throw new Error('Failed to update record');
  }
}

export async function deleteRecord(id: string): Promise<boolean> {
  try {
    const db = await readDatabase();
    const records = db.records || [];
    const initialLength = records.length;
    
    db.records = records.filter(r => r.id !== id);
    
    if (initialLength === db.records.length) {
      return false;
    }
    
    await writeDatabase(db);
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw new Error('Failed to delete record');
  }
}

// Zone specific functions
export async function getZones(): Promise<Zone[]> {
  const db = await readDatabase();
  return db.zones || [];
}

export async function createZone(zone: Omit<Zone, 'createdAt' | 'updatedAt'>): Promise<Zone> {
  try {
    const db = await readDatabase();
    const now = new Date().toISOString();
    
    if (db.zones.find(z => z.id === zone.id)) {
      throw new Error('Zone already exists');
    }
    
    const newZone: Zone = {
      ...zone,
      createdAt: now,
      updatedAt: now
    };
    
    db.zones = [...(db.zones || []), newZone];
    await writeDatabase(db);
    
    return newZone;
  } catch (error) {
    console.error('Error creating zone:', error);
    throw new Error('Failed to create zone');
  }
}

export async function deleteZone(id: string): Promise<boolean> {
  try {
    const db = await readDatabase();
    const zones = db.zones || [];
    const initialLength = zones.length;
    
    db.zones = zones.filter(z => z.id !== id);
    
    if (initialLength === db.zones.length) {
      return false;
    }
    
    await writeDatabase(db);
    return true;
  } catch (error) {
    console.error('Error deleting zone:', error);
    throw new Error('Failed to delete zone');
  }
}

// Count functions
export async function countZones(): Promise<number> {
  try {
    const db = await readDatabase();
    return db.zones?.length || 0;
  } catch (error) {
    console.error('Error counting zones:', error);
    throw new Error('Failed to count zones');
  }
}

export async function countRecords(): Promise<number> {
  try {
    const db = await readDatabase();
    return db.records?.length || 0;
  } catch (error) {
    console.error('Error counting records:', error);
    throw new Error('Failed to count records');
  }
}