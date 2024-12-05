<script lang="ts">
  import { Icon, Tooltip } from '@sveltestrap/sveltestrap';
  import { darkMode } from '../theme';
  import storage from '../storage';
  
  function toggleDarkMode() {
    $darkMode = !$darkMode;
    storage.setItem('ECDDNSTheme', $darkMode ? 'dark' : 'light');
    if (typeof document !== 'undefined') {
      if ($darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }
</script>

<button id="dark-mode-toggle" 
  class="dark-mode-toggle" 
  on:click={toggleDarkMode} 
  class:dark={$darkMode}>
  {#if $darkMode}
    <Icon name="sun-fill" class="sun-icon" />
  {/if}
  {#if !$darkMode}
    <Icon name="moon-fill" />
  {/if}
</button>

<Tooltip target="dark-mode-toggle" placement="top">
  Toggle dark mode
</Tooltip>

<style>
  .dark-mode-toggle {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    border: 1px solid #ced4da;
    background-color: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .dark-mode-toggle.dark {
    background-color: #262626;
    color: white;
    border-color: var(--border-color);
  }

  :global(.sun-icon) {
    color: #f39c12;
  }
</style>
