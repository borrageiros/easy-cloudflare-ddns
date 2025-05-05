<script lang="ts">
  import { goto } from '$app/navigation';
  import { login, isAuthenticated, validateToken } from '$lib/api';
  import { fade } from 'svelte/transition';
  import Icon from '$lib/components/Icon.svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  let password: string = '';
  let rememberSession: boolean = false;
  let error: string = '';
  let isLoading: boolean = false;
  let pageReady: boolean = false;
  let passwordInput: HTMLInputElement;
  
  // Verify authentication when the page loads
  onMount(async () => {
    // If already authenticated with a valid token, redirect to the main page
    if (isAuthenticated()) {
      const isValid = await validateToken();
      if (isValid) {
        goto('/');
        return;
      }
    }
    
    // If not authenticated or the token is invalid, show the login page
    pageReady = true;
    
    // Focus the password input after the component is mounted and ready
    setTimeout(() => {
      if (passwordInput) {
        passwordInput.focus();
      }
    }, 100);
  });
  
  async function handleLogin(): Promise<void> {
    isLoading = true;
    error = '';
    
    try {
      const response = await login(password, rememberSession);
      
      if (response.success) {
        if (browser) {
          window.location.href = '/';
        } else {
          goto('/');
        }
        return;
      } else {
        error = response.message || 'Incorrect password';
      }
    } catch (err) {
      error = 'Authentication error';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }
</script>

{#if pageReady}
  <div class="login-page" transition:fade={{ duration: 200 }}>
    <div class="login-wrapper">
      <div class="login-container card" transition:fade={{ duration: 300 }}>
        <div class="login-header">
          <h1 class="login-title">
            Easy
            <a href="https://www.cloudflare.com" target="_blank">
              <span class="cloud-flare">
                <Icon name="cloud" />
                CloudFlare
              </span>
            </a>
            DDNS
          </h1>
        </div>
        
        <form on:submit|preventDefault={handleLogin}>
          <div class="form-content">
            <div class="form-group">
              <input 
                type="password" 
                id="password" 
                bind:value={password} 
                bind:this={passwordInput}
                disabled={isLoading}
                required
                placeholder="Password"
              />
            </div>
            
            <div class="form-group remember-me">
              <label for="remember">
                <input 
                  type="checkbox" 
                  id="remember" 
                  bind:checked={rememberSession}
                />
                <span>Keep session logged in</span>
              </label>
            </div>
            
            {#if error}
              <div class="error" transition:fade={{ duration: 200 }}>{error}</div>
            {/if}
            
            <button type="submit" class="login-button" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{:else}
  <div class="login-loading">
    <span class="spinner-large"></span>
  </div>
{/if}

<style>
  .login-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100%;
  }
  
  .spinner-large {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 3px solid rgba(128, 128, 128, 0.3);
    border-radius: 50%;
    border-top-color: var(--principal-orange);
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-page {
    height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #222;
    background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
  }

  .login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .login-container {
    width: 100%;
    max-width: 400px;
    padding: 0;
    background-color: #2d2d2d;
    border-radius: 5px;
    border-top: 2px solid var(--primary-color);
    border-bottom: 2px solid var(--secondary-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  
  .login-header {
    background-color: #232323;
    padding: 16px 24px;
    border-bottom: 1px solid #3a3a3a;
  }
  
  .login-title {
    text-align: center;
    margin: 0;
    font-size: 24px;
    color: white;
    font-weight: 500;
    letter-spacing: 1px;
    line-height: 1.4;
  }
  
  form {
    padding: 24px;
  }
  
  .form-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }
  
  .form-group {
    margin-bottom: 20px;
    width: 100%;
    max-width: 300px;
    text-align: center;
  }
  
  .remember-me {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
  }
  
  .remember-me label {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--text-color);
    font-size: 14px;
  }
  
  .remember-me input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
    cursor: pointer;
  }
  
  input {
    width: 100%;
    padding: 12px;
    background-color: #1a1a1a;
    color: white;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    font-size: 16px;
    text-align: center;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-sizing: border-box;
  }
  
  input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
  
  input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(246, 130, 31, 0.2);
  }
  
  input:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .error {
    color: var(--error-color);
    margin-bottom: 16px;
    font-size: 14px;
    text-align: center;
    width: 100%;
    max-width: 300px;
  }
  
  .login-button {
    width: 100%;
    max-width: 300px;
    padding: 12px;
    background-color: var(--primary-color);
    color: white;
    font-size: 16px;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-sizing: border-box;
  }
  
  .login-button:hover {
    background-color: var(--primary-hover);
  }
  
  .login-button:active {
    transform: scale(0.98);
  }
  
  .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .cloud-flare {
    color: var(--principal-orange);
    font-weight: 600;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
  
  a:hover .cloud-flare {
    text-decoration: underline;
  }
</style> 