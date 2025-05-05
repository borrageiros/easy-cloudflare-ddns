<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme';
  import Icon from '$lib/components/Icon.svelte';
  import { icons } from '$lib/icons';
</script>

<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
  {#if $theme === 'light'}
    <span class="icon">
      <Icon name="sun" />
    </span>
    <span class="label">Light</span>
  {:else if $theme === 'dark'}
    <span class="icon">
      <Icon name="moon" />
    </span>
    <span class="label">Dark</span>
  {:else}
    <span class="icon">
      <Icon name="monitor" />
    </span>
    <span class="label">System</span>
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--principal-orange);
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .theme-toggle:hover {
    background-color: var(--card-bg);
    border-color: var(--principal-blue);
    box-shadow: 0 0 4px var(--principal-blue);
  }
  
  .icon {
    font-size: 1.2rem;
  }
  
  .label {
    font-size: 0.9rem;
  }
</style> 