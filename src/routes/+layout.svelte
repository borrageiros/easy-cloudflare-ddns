<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { isAuthenticated, validateToken } from '$lib/api';
	import { initTheme, theme } from '$lib/stores/theme';
	import Icon from '$lib/components/Icon.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { page } from '$app/stores';
  import { logout } from '$lib/api';
  import { clickOutside } from '$lib/actions/clickOutside';
  import TokenGenerator from '$lib/components/TokenGenerator.svelte';
  import ConfigurationModal from '$lib/components/ConfigurationModal.svelte';
  import Loader from '$lib/components/Loader.svelte';
	
	import '$lib/styles/global.css';

	// Check if we are on the login page
	$: isLoginPage = $page.url.pathname === '/login';
  
  // Layout loading state
  let layoutLoading = true;
  let isUserAuthenticated = false;
  
  // State for the dropdown menu
  let settingsMenuOpen = false;
  let settingsButton: HTMLButtonElement;
  
  // State for token generator modal
  let tokenGeneratorOpen = false;
  
  // State for configuration modal
  let configModalOpen = false;
  
  // Apply theme immediately
  if (browser) {
    // Apply theme before mounting
    initTheme();
  }
  
  function toggleSettingsMenu(event: MouseEvent) {
    event.stopPropagation();
    settingsMenuOpen = !settingsMenuOpen;
  }
  
  function openTokenGenerator() {
    tokenGeneratorOpen = true;
    settingsMenuOpen = false;
  }
  
  function openConfigModal() {
    configModalOpen = true;
    settingsMenuOpen = false;
  }
  
  function closeSettingsAndNavigate(path: string) {
    settingsMenuOpen = false;
    goto(path);
  }
  
  // Handle config updates
  function handleConfigUpdated() {
    // Dispatch a custom event to notify components about config changes
    if (browser) {
      window.dispatchEvent(new CustomEvent('config-updated'));
    }
  }

	onMount(async () => {
		// Check authentication
		if (typeof window !== 'undefined') {
			if (window.location.pathname !== '/login') {
				// First check if token exists
				const authenticated = isAuthenticated();
				
				if (!authenticated) {
					goto('/login');
					return;
				}
				
				// Then validate the token
				const isValid = await validateToken();
				if (!isValid) {
					goto('/login');
					return;
				}
        
        // If weve reached this point, the user is authenticated
        isUserAuthenticated = true;
			} else if (isAuthenticated()) {
				// If on login page with valid token, redirect to home
				const isValid = await validateToken();
				if (isValid) {
					goto('/');
          return;
				}
			}
		}
    
    // Change the loading state when verification is complete
    layoutLoading = false;
	});
</script>

{#if layoutLoading && !isLoginPage}
  <div class="layout-loading" class:dark-loading={$theme === 'dark'}>
    <Loader size="large" dark={$theme === 'dark'} />
    <p>Loading...</p>
  </div>
{:else}
  <div class="app-container">
    {#if !isLoginPage}
      <header>
        <div class="header-content">
          <a href="/" on:click={() => settingsMenuOpen = false}>
            <h1 class="full-title">Easy <span class="cloud-flare"><Icon name="cloud" /> CloudFlare</span> DDNS</h1>
            <h1 class="mobile-title">E<span class="cloud-flare">C</span>DDNS</h1>
          </a>
          
          <div class="settings-container">
            <button 
              class="settings-icon" 
              on:click={(e) => toggleSettingsMenu(e)} 
              aria-label="Settings"
              bind:this={settingsButton}
            >
              {#if settingsMenuOpen}
                <Icon name="chevron-up" />
              {:else}
                <Icon name="chevron-down" />
              {/if}
              <Icon name="settings" />
            </button>
            
            {#if settingsMenuOpen}
              <div class="settings-dropdown" use:clickOutside={{ 
                callback: () => settingsMenuOpen = false,
                exclude: settingsButton 
              }}>
                <div class="settings-item">
                  <ThemeToggle />
                </div>
                <div class="settings-item">
                  <button class="settings-button" on:click={openConfigModal}>
                    <Icon name="sliders" />
                    <span>Configuration</span>
                  </button>
                </div>
                <div class="settings-item">
                  <button class="settings-button" on:click={openTokenGenerator}>
                    <Icon name="key" />
                    <span>Generate API KEY</span>
                  </button>
                </div>
                <div class="settings-item">
                  <button class="settings-button" on:click={() => closeSettingsAndNavigate('/api/docs')}>
                    <Icon name="book" />
                    <span>API Docs</span>
                  </button>
                </div>
                <div class="settings-item">
                  <button class="settings-button logout-button" on:click={() => {
                    settingsMenuOpen = false;
                    logout();
                  }}>
                    <Icon name="log-out" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </header>
    {/if}
    
    <main class:login-main={isLoginPage}>
      <slot />
    </main>
    
    {#if !isLoginPage}
      <footer>
        <div class="footer-content">
          <a href="https://borrageiros.com" target="_blank" rel="noopener noreferrer" on:click={() => settingsMenuOpen = false}>
            borrageiros
          </a>
          <span class="separator">|</span>
          <a href="https://github.com/borrageiros/easy-cloudflare-ddns" target="_blank" rel="noopener noreferrer">
            github
          </a>
        </div>
      </footer>
    {/if}
  </div>
{/if}

<TokenGenerator bind:open={tokenGeneratorOpen} />
<ConfigurationModal bind:open={configModalOpen} on:configUpdated={handleConfigUpdated} />

<style>
  .layout-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: var(--background-color);
    z-index: 9999;
    color: var(--text-color);
  }
  
  /* Explicit styles for dark theme loading */
  .dark-loading {
    background-color: #1a1a1a;
    color: #f0f0f0;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
  }
  
  header {
    background-color: var(--header-bg);
    padding: 1rem;
    box-shadow: var(--shadow);
    border-bottom: 3px solid var(--principal-orange);
    width: 100%;
    box-sizing: border-box;
  }
  
  .header-content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 0 1rem;
  }
  
  main {
    flex: 1;
    padding: 2rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  
  .login-main {
    padding: 0;
    max-width: none;
  }
  
  footer {
    background-color: var(--footer-bg);
    padding: 1rem;
    text-align: center;
    border-top: 2px solid var(--principal-blue);
    width: 100%;
    box-sizing: border-box;
    margin-top: auto;
  }
  
  .footer-content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
  
  .footer-content a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.2s ease, transform 0.2s ease;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
  
  .footer-content a:hover {
    color: var(--principal-orange);
    transform: translateY(-1px);
    background-color: rgba(var(--principal-orange-rgb), 0.05);
  }
  
  .footer-content a:active {
    transform: translateY(0);
  }
  
  .separator {
    color: var(--text-color-secondary);
  }
  
  .cloud-flare {
    color: var(--principal-orange);
    font-weight: 600;
  }
  
  .settings-container {
    position: relative;
  }
  
  .settings-icon {
    background: none;
    border: none;
    color: var(--text-color);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .settings-icon:hover {
    color: var(--principal-orange);
  }
  
  .settings-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    background-color: var(--card-bg);
    border-radius: 0.5rem;
    box-shadow: var(--shadow);
    min-width: 200px;
    z-index: 100;
    border: 1px solid var(--border-color);
    overflow: hidden;
  }

  
  .settings-item {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .settings-item:last-child {
    border-bottom: none;
  }
  
  .logout-button:hover {
    background-color: var(--card-hover);
    color: var(--error-color) !important;
  }

  .settings-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 0.5rem;
    width: 100%;
    text-align: left;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .settings-button:hover {
		background-color: var(--card-hover);
    color: var(--principal-orange);
  }
  
  .full-title {
    display: block;
    transition: opacity 0.3s ease;
  }
  
  .mobile-title {
    display: none;
    transition: opacity 0.3s ease;
  }
  
  a h1 {
    transition: font-size 0.3s ease;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .header-content {
      padding: 0 0.5rem;
    }
    
    main {
      padding: 1.5rem 0.5rem;
    }
    
    footer {
      padding: 0.75rem 0.5rem;
    }
    
    .footer-content {
      padding: 0;
      font-size: 0.9rem;
    }
    
    h1 {
      font-size: 1.5rem;
    }
    
    .full-title {
      display: block;
    }
    
    .mobile-title {
      display: none;
    }
  }
  
  @media (max-width: 480px) {
    header {
      padding: 0.7rem 0.5rem;
    }
    
    .header-content {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0;
    }
    
    main {
      padding: 1rem 0.5rem;
    }
    
    .settings-container {
      align-self: center;
      margin-top: 0;
    }
    
    .full-title {
      display: none;
    }
    
    .mobile-title {
      display: block;
      font-size: 1.4rem;
    }
    
    .settings-icon {
      padding: 0.4rem;
      font-size: 1.3rem;
    }
    
    a {
      display: flex;
      align-items: center;
    }
    
    footer {
      padding: 0.6rem 0.5rem;
    }
    
    .footer-content {
      font-size: 0.8rem;
      gap: 0.3rem;
    }
    
    .footer-content a {
      padding: 0.2rem 0.4rem;
    }
  }
</style>
