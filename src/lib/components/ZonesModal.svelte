<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { getCloudFlareZones, createZone, getZones } from '$lib/api';
  import type { CloudFlareZone, DnsZone } from '$lib/api';
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';
  
  export let open = false;
  
  const dispatch = createEventDispatcher();
  
  let loading = false;
  let saving = false;
  let cloudflareZones: CloudFlareZone[] = [];
  let databaseZones: DnsZone[] = [];
  let filteredZones: CloudFlareZone[] = [];
  let error = '';
  let success = '';
  let selectedZone: CloudFlareZone | null = null;
  
  function closeModal() {
    open = false;
    resetForm();
  }
  
  function resetForm() {
    error = '';
    success = '';
    selectedZone = null;
  }
  
  async function loadZones() {
    loading = true;
    error = '';
    success = '';
    
    try {
      // Load CloudFlare zones and database zones
      const [cloudflareZonesData, dbZones] = await Promise.all([
        getCloudFlareZones(),
        getZones()
      ]);
      
      if (cloudflareZonesData && cloudflareZonesData.length > 0) {
        cloudflareZones = cloudflareZonesData;
        
        // Save database zones
        databaseZones = dbZones || [];
        
        // Filter CloudFlare zones that are not in the database
        filteredZones = cloudflareZones.filter(cfZone => 
          !databaseZones.some(dbZone => dbZone.id === cfZone.id)
        );
        
        if (filteredZones.length === 0) {
          error = 'There are no more zones to add in your account';
        }
        
        // Select the first available zone if there is any
        selectedZone = filteredZones.length > 0 ? filteredZones[0] : null;
      } else if (cloudflareZonesData && cloudflareZonesData.length === 0) {
        cloudflareZones = [];
        filteredZones = [];
        selectedZone = null;
        error = 'No DNS zones found in your CloudFlare account';
      } else {
        error = 'Failed to load DNS zones';
        cloudflareZones = [];
        filteredZones = [];
        selectedZone = null;
      }
    } catch (err) {
      console.error('Error loading zones:', err);
      error = 'Error loading DNS zones';
      cloudflareZones = [];
      filteredZones = [];
      selectedZone = null;
    } finally {
      loading = false;
    }
  }
  
  async function saveSelectedZone() {
    if (!selectedZone) {
      error = 'Please select a zone first';
      return;
    }
    
    saving = true;
    error = '';
    success = '';
    
    try {
      const zoneData = {
        id: selectedZone.id,
        name: selectedZone.name,
        status: selectedZone.status
      };
      
      const savedZone = await createZone(zoneData);
      
      if (savedZone) {
        success = `Zone "${selectedZone.name}" saved successfully`;
        dispatch('zoneAdded', savedZone);
        
        // Update zone lists after saving
        databaseZones = [...databaseZones, savedZone];
        filteredZones = filteredZones.filter(zone => zone.id !== selectedZone?.id);
        selectedZone = filteredZones.length > 0 ? filteredZones[0] : null;
        
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        error = 'Failed to save zone';
      }
    } catch (err) {
      console.error('Error saving zone:', err);
      error = 'Error saving zone';
    } finally {
      saving = false;
    }
  }
  
  $: if (open) {
    loadZones();
  }
</script>

<Modal title="DNS Zones Management" {open} on:close={closeModal}>
  <div class="zones-manager">
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
    
    {#if loading}
      <div class="loading-indicator">
        <Loader size="small" />
        <span>Loading zones...</span>
      </div>
    {:else if filteredZones.length === 0}
      <div class="empty-state">
        <Icon name="database" />
        <p>{error || 'No new DNS zones available to add'}</p>
      </div>
    {:else}
      <div class="zones-list">
        <h3>Select a zone</h3>
        <div class="zones-dropdown">
          <select bind:value={selectedZone} disabled={saving}>
            {#each filteredZones as zone}
              <option value={zone}>{zone.name}</option>
            {/each}
          </select>
        </div>
        
        {#if selectedZone}
          <div class="zone-details">
            <h4>Zone Details</h4>
            <div class="detail-item">
              <span class="detail-label">Id:</span>
              <span class="detail-value">{selectedZone.id}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{selectedZone.name}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="status-badge status-{selectedZone.status?.toLowerCase() || 'unknown'}">
                {selectedZone.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>
        {/if}
      </div>
    {/if}
    
    <div class="action-buttons">
      <button 
        class="refresh-button" 
        on:click={loadZones} 
        disabled={loading || saving}
      >
        {#if loading}
          <Loader size="small" />
        {:else}
          <Icon name="refresh" />
        {/if}
        Refresh Zones
      </button>
      
      <div class="right-buttons">
        <button 
          class="save-button" 
          on:click={saveSelectedZone}
          disabled={loading || saving || !selectedZone}
        >
          {#if saving}
            <Loader size="small" />
          {:else}
            <Icon name="save" />
          {/if}
          Save Zone
        </button>
        
        <button 
          class="close-button" 
          on:click={closeModal}
          disabled={saving}
        >
          <Icon name="x" />
          Close
        </button>
      </div>
    </div>
  </div>
</Modal>

<style>
  .zones-manager {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .error-message {
    color: var(--error-color);
    padding: 8px;
    border: 1px solid var(--error-color);
    border-radius: 4px;
    background-color: rgba(var(--error-color-rgb), 0.05);
    font-size: 0.875rem;
  }
  
  .success-message {
    color: var(--success-color);
    padding: 8px;
    border: 1px solid var(--success-color);
    border-radius: 4px;
    background-color: rgba(var(--success-color-rgb), 0.05);
    font-size: 0.875rem;
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-color);
    font-size: 0.875rem;
    padding: 16px 0;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
    color: var(--text-color-secondary);
    gap: 12px;
  }
  
  .empty-state p {
    margin: 0;
  }
  
  .zones-list {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 16px;
    background-color: var(--card-bg);
  }
  
  .zones-list h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 1rem;
  }
  
  .zones-dropdown {
    margin-bottom: 16px;
  }
  
  .zones-dropdown select {
    width: 100%;
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  .zone-details {
    margin-top: 16px;
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
  }
  
  .zone-details h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 0.9rem;
  }
  
  .detail-item {
    display: flex;
    margin-bottom: 8px;
  }
  
  .detail-label {
    font-weight: 500;
    width: 80px;
    flex-shrink: 0;
  }
  
  .detail-value {
    color: var(--text-color-secondary);
    word-break: break-all;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  
  .status-active {
    background-color: rgba(var(--success-color-rgb), 0.15);
    color: var(--success-color);
    border: 1px solid var(--success-color);
  }
  
  .status-pending {
    background-color: rgba(var(--warning-color-rgb), 0.15);
    color: var(--warning-color);
    border: 1px solid var(--warning-color);
  }
  
  .status-initializing {
    background-color: rgba(var(--principal-blue-rgb), 0.15);
    color: var(--principal-blue);
    border: 1px solid var(--principal-blue);
  }
  
  .status-moved {
    background-color: rgba(var(--text-color-rgb), 0.1);
    color: var(--text-color-secondary);
    border: 1px solid var(--border-color);
  }
  
  .status-deleted {
    background-color: rgba(var(--error-color-rgb), 0.15);
    color: var(--error-color);
    border: 1px solid var(--error-color);
  }
  
  .status-unknown {
    background-color: rgba(var(--text-color-rgb), 0.1);
    color: var(--text-color-secondary);
    border: 1px solid var(--border-color);
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  
  .right-buttons {
    display: flex;
    gap: 8px;
  }
  
  .refresh-button, .close-button, .save-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
  }
  
  .refresh-button {
    background-color: var(--principal-blue);
    color: var(--text-color);
  }
  
  .refresh-button:hover:not(:disabled) {
    background-color: var(--principal-blue-dark);
  }
  
  .save-button {
    background-color: var(--principal-orange);
    color: var(--text-color);
  }
  
  .save-button:hover:not(:disabled) {
    background-color: var(--principal-orange-dark);
  }
  
  .close-button {
    background-color: var(--card-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }
  
  .close-button:hover:not(:disabled) {
    background-color: var(--card-hover);
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Responsive styles */
  @media (max-width: 640px) {
    .right-buttons {
      gap: 4px;
    }
    
    .refresh-button, .close-button, .save-button {
      padding: 8px 12px;
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 480px) {
    .action-buttons {
      flex-direction: column;
      gap: 12px;
    }
    
    .right-buttons {
      justify-content: space-between;
      width: 100%;
    }
    
    .refresh-button {
      width: 100%;
      justify-content: center;
    }
    
    .close-button, .save-button {
      flex: 1;
      justify-content: center;
    }
    
    .detail-item {
      flex-direction: column;
      gap: 4px;
    }
    
    .detail-label {
      width: 100%;
    }
  }
</style> 