import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

// Determine the initial theme based on system preference or stored preference
function getInitialTheme(): Theme {
  if (!browser) return 'light';
  
  // Check if there is a saved theme
  const storedTheme = localStorage.getItem('theme') as Theme;
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  
  // If there is no saved theme or it is invalid, use the system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Create the store with the initial theme
export const theme = writable<Theme>(getInitialTheme());

// Apply the theme when the page loads
export function initTheme(): void {
  if (browser) {
    // Subscribe to theme changes
    theme.subscribe((value) => {
      // Save the preference in localStorage
      localStorage.setItem('theme', value);
      
      // Get the root element
      const root = document.documentElement;
      
      // Remove existing theme classes
      root.classList.remove('light-theme', 'dark-theme');
      
      // Apply the selected theme
      root.classList.add(`${value}-theme`);
    });
    
    // Observe changes in system preferences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // If there is no saved theme or the storage was removed, update according to the system
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme) {
        theme.set(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Change theme
export function toggleTheme(): void {
  theme.update(current => current === 'light' ? 'dark' : 'light');
} 