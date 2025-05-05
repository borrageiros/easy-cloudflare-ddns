<script lang="ts">
  import { theme, toggleTheme } from '$lib/stores/theme';
  import Icon from '$lib/components/Icon.svelte';
</script>

<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
  <Icon name="sun" />
    {#if $theme === 'light'}
      <Icon name="toggle-left"  />
    {:else if $theme === 'dark'}
      <Icon name="toggle-right"  />
    {/if}
    <Icon name="moon" />
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--card-bg);
    color: var(--text-color);
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .theme-toggle:hover {
    background-color: var(--card-bg);
    border-color: var(--principal-blue);
  }
</style> 