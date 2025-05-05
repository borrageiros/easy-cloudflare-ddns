import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

// Initialize with the saved theme in localStorage or 'system' by default
const storedTheme = browser ? localStorage.getItem('theme') as Theme || 'system' : 'system';

// Create the store
export const theme = writable<Theme>(storedTheme);

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
      
      if (value === 'system') {
        // Use the system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
      } else {
        // Use the selected theme manually
        root.classList.add(`${value}-theme`);
      }
    });
    
    // Observe changes in system preferences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      // If configured in "system", update when the system preference changes
      theme.update(current => {
        if (current === 'system') {
          // Force update to apply changes
          return 'system';
        }
        return current;
      });
    });
  }
}

// Change theme
export function toggleTheme(): void {
  theme.update(current => {
    if (current === 'light') return 'dark';
    if (current === 'dark') return 'system';
    return 'light';
  });
} 