import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { join } from 'path';

const DATA_DIR: string = join(process.cwd(), 'data');
const SECRET_FILE: string = join(DATA_DIR, 'jwt-secret');

export function getJwtSecret(): string {
  try {
    // Check if the data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Check if the file exists
    if (existsSync(SECRET_FILE)) {
      // Read the existing secret
      return readFileSync(SECRET_FILE, 'utf-8');
    }
    
    // If it doesn't exist, generate a new secret
    const newSecret: string = randomBytes(64).toString('hex');
    
    // Save the secret to the file
    writeFileSync(SECRET_FILE, newSecret);
    
    return newSecret;
  } catch (error) {
    console.error('Error managing JWT_SECRET:', error);
    // Fallback to a default secret in case of error
    return process.env.JWT_SECRET || 'default_secret_key';
  }
} 