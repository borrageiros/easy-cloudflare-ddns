import { writable } from 'svelte/store';
import storage from './storage';

async function initializeTheme() {
  const storedTheme = await storage.getItem('ECDDNSTheme');
  return storedTheme === 'dark';
}

export const darkMode = writable(false);

initializeTheme().then((isDark) => {
  darkMode.set(isDark);
});