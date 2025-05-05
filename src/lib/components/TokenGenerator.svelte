<script lang="ts">
  import { onMount } from 'svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { generateToken } from '$lib/api';
  import Icon from '$lib/components/Icon.svelte';
  
  export let open = false;
  
  let generating = false;
  let rememberSession = false;
  let token = '';
  let error = '';
  
  function closeModal() {
    open = false;
    token = '';
    error = '';
  }
  
  async function handleGenerateToken() {
    generating = true;
    error = '';
    
    try {
      const response = await generateToken(rememberSession);
      
      if (response.success && response.token) {
        token = response.token;
      } else {
        error = response.message || 'Failed to generate token';
      }
    } catch (err) {
      error = 'An unexpected error occurred';
      console.error(err);
    } finally {
      generating = false;
    }
  }
  
  function copyToClipboard() {
    if (token) {
      navigator.clipboard.writeText(token)
        .then(() => {
          // Optional: Show success message
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  }
  
  // Regenerate token when remember session changes
  $: if (open && rememberSession !== undefined) {
    handleGenerateToken();
  }
  
  onMount(() => {
    if (open) {
      handleGenerateToken();
    }
  });
</script>

<Modal title="Generate Token" {open} on:close={closeModal}>
  <div class="token-generator">
    <div class="options">
      <label class="option">
        <input 
          type="checkbox" 
          bind:checked={rememberSession}
          disabled={generating}
        >
        <span>Permanent token (no expiration)</span>
      </label>
    </div>
    
    {#if generating}
      <div class="generating-indicator">
        <span class="spinner"></span>
        <span>Generating token...</span>
      </div>
    {/if}
    
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
    
    {#if token}
      <div class="token-result">
        <div class="token-header">
          <h3>Generated Token</h3>
          <button class="copy-button" on:click={copyToClipboard}>
            <Icon name="clipboard" />
            Copy
          </button>
        </div>
        <textarea 
          class="token-display" 
          rows="4" 
          readonly 
          value={token}
        ></textarea>
        <div class="token-info">
          {#if rememberSession}
            <p>This token has no expiration date.</p>
          {:else}
            <p>This token will expire in 24 hours.</p>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</Modal>

<style>
  .token-generator {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .options {
    margin-bottom: 8px;
  }
  
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  
  .generating-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(128, 128, 128, 0.3);
    border-radius: 50%;
    border-top-color: var(--principal-orange);
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .token-result {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 16px;
    background-color: var(--background-color);
    margin: 0 2px;
    width: calc(100% - 4px);
    box-sizing: border-box;
  }
  
  .token-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .token-header h3 {
    margin: 0;
    font-size: 1rem;
  }
  
  .copy-button {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .copy-button:hover {
    background-color: var(--card-hover);
  }
  
  .token-display {
    width: calc(100% - 20px);
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 8px;
    color: var(--text-color);
    font-family: monospace;
    font-size: 0.875rem;
    resize: vertical;
  }
  
  .token-info {
    margin-top: 8px;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }
  
  .error-message {
    color: var(--error-color);
    padding: 8px;
    border: 1px solid var(--error-color);
    border-radius: 4px;
    background-color: rgba(255, 0, 0, 0.05);
  }
  
  /* Responsive styles */
  @media (max-width: 640px) {
    .token-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .copy-button {
      align-self: flex-end;
    }
  }
  
  @media (max-width: 480px) {
    .token-display {
      font-size: 0.75rem;
    }
    
    .token-info {
      font-size: 0.8rem;
    }
    
    .option {
      font-size: 0.9rem;
    }
  }
</style> 