<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let color: string | null = null;
  export let message: string | null = null;
  export let fullPage: boolean = false;
  export let overlay: boolean = false;
  export let dark: boolean = false;

  // Determine size in pixels
  $: width = size === 'small' ? 16 : size === 'medium' ? 30 : 50;
  $: borderWidth = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
  
  // Calculate classes based on props
  $: loaderClasses = [
    fullPage ? 'loader-full-page' : '',
    overlay ? 'loader-overlay' : '',
    dark ? 'loader-dark' : ''
  ].filter(Boolean).join(' ');
</script>

<div class="loader-container {loaderClasses}">
  <div class="loader-wrapper">
    <span 
      class="spinner"
      style="
        width: {width}px; 
        height: {width}px; 
        border-width: {borderWidth}px;
        {color ? `border-top-color: ${color};` : ''}
      "
    ></span>
    {#if message}
      <p class="loader-message">{message}</p>
    {/if}
  </div>
</div>

<style>
  .loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .loader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .loader-message {
    margin: 0.75rem 0 0 0;
    color: var(--text-color);
    font-size: 0.95rem;
  }
  
  .spinner {
    display: inline-block;
    border: 3px solid rgba(var(--text-color-rgb), 0.3);
    border-radius: 50%;
    border-top-color: var(--principal-orange);
    animation: spin 1s ease-in-out infinite;
  }
  
  .loader-full-page {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100vh;
    width: 100vw;
    background-color: var(--background-color);
    z-index: 9999;
  }
  
  .loader-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(var(--background-color-rgb), 0.8);
    z-index: 100;
  }
  
  .loader-dark .spinner {
    border: 3px solid rgba(240, 240, 240, 0.3);
    border-top-color: #F6821F;
  }
  
  .loader-dark .loader-message {
    color: #f0f0f0;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style> 