<script lang="ts">
  import { onMount } from 'svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { getUserConfig, createUserConfig, updateUserConfig, verifyCredentials } from '$lib/api';
  import type { UserConfig } from '$lib/api';
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';
  
  export let open = false;
  
  const dispatch = createEventDispatcher();
  
  let saving = false;
  let email = '';
  let apiKey = '';
  let checkInterval = 300;
  let error = '';
  let success = '';
  let verifySuccess = '';
  let isVerifying = false;
  let isNewConfig = true;
  
  function closeModal() {
    if (!saving && !isNewConfig) {
      open = false;
      resetForm();
    }
  }
  
  function resetForm() {
    error = '';
    success = '';
    verifySuccess = '';
  }
  
  async function loadConfig() {
    resetForm();
    const config = await getUserConfig();
    
    if (config) {
      email = config.email || '';
      apiKey = config.apiKey || '';
      checkInterval = config.checkInterval || 300;
      isNewConfig = !config.email || !config.apiKey;
    }
  }
  
  async function verifyApiCredentials() {
    if (!email || !apiKey) {
      error = 'Email and API Key are required';
      verifySuccess = '';
      return false;
    }
    
    isVerifying = true;
    error = '';
    verifySuccess = '';
    
    try {
      const credentialsResponse = await verifyCredentials(email, apiKey);
      if (!credentialsResponse.isValid) {
        error = 'Invalid credentials';
        return false;
      }
      verifySuccess = 'Credentials verified successfully!';
      return true;
    } catch (err) {
      error = 'Error verifying credentials';
      return false;
    } finally {
      isVerifying = false;
    }
  }
  
  async function handleSaveConfig() {
    resetForm();
    saving = true;
    
    try {
      // Validate inputs
      if (!email) {
        error = 'Email is required';
        return;
      }
      
      if (!apiKey) {
        error = 'API Key is required';
        return;
      }
      
      if (checkInterval < 60) {
        error = 'The minimum interval is 60 seconds';
        return;
      }
      
      // Verify credentials
      const credentialsValid = await verifyApiCredentials();
      if (!credentialsValid) {
        return;
      }
      
      let config: UserConfig | null;
      
      if (isNewConfig) {
        config = await createUserConfig({
          email,
          apiKey,
          checkInterval
        });
      } else {
        config = await updateUserConfig({
          email,
          apiKey,
          checkInterval
        });
      }
      
      if (config) {
        success = 'Configuration saved successfully';
        isNewConfig = false;
        
        // Dispatch event to notify parent that config was updated
        if (typeof window !== 'undefined') {
          const customEvent = new CustomEvent('config-updated', { 
            detail: { config, checkInterval },
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(customEvent);
        }
        
        if (!isNewConfig) {
          setTimeout(() => {
            closeModal();
          }, 1500);
        }
      } else {
        error = 'Error saving configuration';
      }
    } catch (err) {
      console.error('Error saving configuration:', err);
      error = 'Error saving configuration';
    } finally {
      saving = false;
    }
  }
  
  $: if (open) {
    loadConfig();
  }
  
  // Clear verification status when inputs change
  $: if (email || apiKey) {
    verifySuccess = '';
  }
</script>

<Modal title="Configuration" {open} on:close={closeModal} closable={!isNewConfig}>
  <div class="config-form">
    {#if isNewConfig}
      <div class="info-message">
        <Icon name="info" />
        <span>You need to configure your CloudFlare credentials to use this application.</span>
      </div>
    {/if}
    
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
    
    {#if success}
      <div class="success-message">
        {success}
      </div>
    {/if}
    
    <div class="form-group">
      <label for="email">CloudFlare Email</label>
      <input 
        type="email" 
        id="email" 
        bind:value={email} 
        disabled={saving}
        placeholder="email@example.com"
      />
    </div>
    
    <div class="form-group">
      <label for="apiKey">API Key</label>
      <input 
        type="password" 
        id="apiKey" 
        bind:value={apiKey} 
        disabled={saving}
        placeholder="CloudFlare API Key"
      />
      <a href="https://developers.cloudflare.com/fundamentals/api/get-started/create-token/" target="_blank">
        <small>You can find your API Key in the CloudFlare panel</small>
      </a>
    </div>
    
    <div class="form-group">
      <label for="checkInterval">Verification interval (seconds)</label>
      <input 
        type="number" 
        id="checkInterval" 
        bind:value={checkInterval} 
        disabled={saving}
        min="60"
        step="60"
      />
      <small>Minimum recommended: 300 seconds (5 minutes)</small>
    </div>
    
    {#if verifySuccess}
      <div class="success-message verify-success">
        <Icon name="check-circle" />
        {verifySuccess}
      </div>
    {/if}
    
    <div class="form-actions">
      <button 
        class="verify-button" 
        on:click={verifyApiCredentials} 
        disabled={saving || isVerifying || !email || !apiKey}
      >
        {#if isVerifying}
          <Loader size="small" />
        {:else}
          <Icon name="check-circle" />
        {/if}
        Verify credentials
      </button>
      
      <button 
        class="save-button" 
        on:click={handleSaveConfig} 
        disabled={saving || !email || !apiKey}
      >
        {#if saving}
          <Loader size="small" />
        {:else}
          <Icon name="save" />
        {/if}
        Save configuration
      </button>
    </div>
  </div>
</Modal>

<style>
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  label {
    font-weight: 500;
    color: var(--text-color);
  }
  
  input {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  input:focus {
    border-color: var(--principal-orange);
    outline: none;
  }
  
  small {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    margin-top: 4px;
  }
  
  .form-actions {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 8px;
  }
  
  .verify-button, .save-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
  }
  
  .verify-button {
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }
  
  .verify-button:hover:not(:disabled) {
    background-color: var(--card-hover);
    color: var(--principal-blue);
  }
  
  .save-button {
    background-color: var(--principal-orange);
    color: var(--text-color);
  }
  
  .save-button:hover:not(:disabled) {
    background-color: var(--principal-orange-dark);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error-message {
    color: var(--error-color);
    padding: 8px;
    border: 1px solid var(--error-color);
    border-radius: 4px;
    background-color: var(--background-color);
    font-size: 0.875rem;
  }
  
  .success-message {
    color: var(--success-color);
    padding: 8px;
    border: 1px solid var(--success-color);
    border-radius: 4px;
    background-color: var(--background-color);
    font-size: 0.875rem;
  }
  
  .info-message {
    color: var(--principal-blue);
    padding: 8px;
    border: 1px solid var(--principal-blue);
    border-radius: 4px;
    background-color: var(--background-color);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .verify-success {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  
  /* Responsive styles */
  @media (max-width: 640px) {
    .form-actions {
      gap: 8px;
    }
    
    .verify-button, .save-button {
      padding: 8px 12px;
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 480px) {
    .form-actions {
      flex-direction: column;
      gap: 12px;
    }
    
    .verify-button, .save-button {
      width: 100%;
      justify-content: center;
    }
    
    input {
      font-size: 0.8rem;
    }
    
    label {
      font-size: 0.9rem;
    }
  }
</style> 