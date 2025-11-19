<script lang="ts">
  import ZonesModal from "$lib/components/ZonesModal.svelte";
  import RecordsModal from "$lib/components/RecordsModal.svelte";
  import ConfigurationModal from "$lib/components/ConfigurationModal.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import ZonesTable from "$lib/components/ZonesTable.svelte";
  import RecordsTable from "$lib/components/RecordsTable.svelte";
  import { onMount, onDestroy } from "svelte";
  import { getZones, deleteZone, getRecords, getServerStatus, toggleInterval, forceInterval, forceCloudflareUpdate, getUserConfig, isAuthenticated } from "$lib/api";
  import type { DnsZone, DnsRecord, ServerStatusResponse } from "$lib/api";
  import { browser } from '$app/environment';
  import Loader from '$lib/components/Loader.svelte';
  
  // Initial loading state to avoid flashing
  let initialLoading = true;
  
  let zonesModalOpen = false;
  let recordsModalOpen = false;
  let recordEditMode = false;
  let recordToEdit: DnsRecord | null = null;
  let configModalOpen = false;
  
  let zones: DnsZone[] = [];
  let records: DnsRecord[] = [];
  let filteredZones: DnsZone[] = [];
  let filteredRecords: DnsRecord[] = [];
  let zoneSearchQuery = '';
  let recordSearchQuery = '';
  let loading = false;
  let loadingRecords = false;
  let error = '';
  let recordsError = '';
  let deletingZoneId: string | null = null;
  let serverStatus: ServerStatusResponse | null = null;
  let togglingInterval = false;
  let forcingCloudflareUpdate = false;
  
  // Countdown timer variables
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let countdownSeconds = 0;
  
  function openRecordsModal(edit = false, record: DnsRecord | null = null) {
    recordEditMode = edit;
    recordToEdit = record;
    recordsModalOpen = true;
  }

  // Check if user configuration exists
  async function checkUserConfig() {
    try {
      const config = await getUserConfig();
      
      // Check if required fields are configured
      if (!config || !config.email || !config.apiKey) {
        configModalOpen = true;
      }
    } catch (err) {
      console.error('Error checking user config:', err);
    }
  }

  // Reload the server status and other data after config update
  async function setupConfigUpdateListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('config-updated', async (event: Event) => {
        await loadServerStatus();
      });
    }
  }

  async function loadServerStatus() {    
    try {
      const statusData = await getServerStatus();
      if (statusData?.data) {
        serverStatus = statusData;
        
        // If paused and nextCheck is 0, set a minimum value
        // to avoid infinite requests
        if (statusData.data.isIntervalPaused && statusData.data.nextCheck <= 0) {
          countdownSeconds = 1;
        } else {
          countdownSeconds = statusData.data.nextCheck;
        }
        
        startCountdown();
        return statusData;
      } else {
        serverStatus = null;
        return null;
      }
    } catch (err) {
      console.error('Error loading server status:', err);
      serverStatus = null;
      return null;
    }
  }
  
  function startCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
      if (countdownSeconds > 0) {
        countdownSeconds--;
      } else if (!serverStatus?.data.isIntervalPaused) {
        loadServerStatus();
      }
    }, 1000);
  }
  
  async function toggleCheckInterval() {
    if (togglingInterval || !serverStatus) return;
    
    togglingInterval = true;
    try {
      const response = await toggleInterval();
      
      if (response && serverStatus) {
        serverStatus = {
          ...serverStatus,
          data: {
            ...serverStatus.data,
            isIntervalPaused: response.paused,
            nextCheck: response.nextCheck
          }
        };
        countdownSeconds = response.nextCheck || 0;
        
        if (response.paused && countdownSeconds <= 0) {
          countdownSeconds = 1;
        }
      } else {
        console.error('Failed to toggle interval');
      }
    } catch (err) {
      console.error('Error toggling interval:', err);
    } finally {
      togglingInterval = false;
    }
  }

  async function forceCheckInterval() {
    if (!serverStatus) return;
    
    try {
      const response = await forceInterval();
      const serverStatusData = await getServerStatus();
      
      if (response && serverStatusData) {
        serverStatus = {
          ...serverStatusData,
          data: {
            ...serverStatusData.data,
            nextCheck: response.nextCheck
          }
        };
        countdownSeconds = response.nextCheck || 1;
      } else {
        console.error('Failed to force interval');
      }
    } catch (err) {
      console.error('Error forcing interval:', err);
    }
  }

  async function handleForceCloudflareUpdate() {
    if (forcingCloudflareUpdate) return;
    
    forcingCloudflareUpdate = true;
    try {
      const success = await forceCloudflareUpdate();
      if (success) {
        const serverStatusData = await getServerStatus();
        if (serverStatusData) {
          serverStatus = serverStatusData;
        }
      } else {
        console.error('Failed to force Cloudflare update');
      }
    } catch (err) {
      console.error('Error forcing Cloudflare update:', err);
    } finally {
      forcingCloudflareUpdate = false;
    }
  }
  
  
  async function loadZones() {
    loading = true;
    error = '';
    
    try {
      const zonesData = await getZones();
      if (zonesData) {
        zones = zonesData;
        filterZones();
        return zonesData;
      } else {
        zones = [];
        filteredZones = [];
        error = 'Failed to load zones';
        return null;
      }
    } catch (err) {
      console.error('Error loading zones:', err);
      error = 'Error loading zones';
      zones = [];
      filteredZones = [];
      return null;
    } finally {
      loading = false;
    }
  }
  
  async function loadRecords() {
    loadingRecords = true;
    recordsError = '';
    
    try {
      const recordsData = await getRecords();
      if (recordsData) {
        records = recordsData;
        filterRecords();
        return recordsData;
      } else {
        records = [];
        filteredRecords = [];
        recordsError = 'Failed to load records';
        return null;
      }
    } catch (err) {
      console.error('Error loading records:', err);
      recordsError = 'Error loading records';
      records = [];
      filteredRecords = [];
      return null;
    } finally {
      loadingRecords = false;
    }
  }
  
  function filterZones() {
    if (!zoneSearchQuery.trim()) {
      filteredZones = [...zones];
      return;
    }
    
    const query = zoneSearchQuery.toLowerCase().trim();
    filteredZones = zones.filter(zone => 
      zone.name.toLowerCase().includes(query)
    );
  }
  
  function filterRecords() {
    if (!recordSearchQuery.trim()) {
      filteredRecords = [...records];
      return;
    }
    
    const query = recordSearchQuery.toLowerCase().trim();
    filteredRecords = records.filter(record => 
      record.name.toLowerCase().includes(query) || 
      (record.type && record.type.toLowerCase().includes(query))
    );
  }
  
  onMount(async () => {
    if (browser) {
      setupConfigUpdateListener();

      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        window.location.href = '/login';
        return;
      }
      
      // Load initial data
      await Promise.all([
        loadZones(),
        loadRecords(),
        loadServerStatus(),
        checkUserConfig()
      ]);
      
      // Change initial loading state
      initialLoading = false;
    }
  });
  
  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });

  function handleZoneAdded(event: CustomEvent) {
    const newZone = event.detail;
    zones = [...zones, newZone];
    filterZones();
  }
  
  function handleRecordAdded(event: CustomEvent) {
    const newRecord = event.detail;
    records = [...records, newRecord];
    filterRecords();
  }
  
  function handleRecordUpdated(event: CustomEvent) {
    const updatedRecord = event.detail;
    
    records = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    
    filterRecords();
  }
  
  function handleRecordDeleted(event: CustomEvent) {
    const deletedRecord = event.detail;
    
    records = records.filter(record => record.id !== deletedRecord.id);
    filterRecords();
  }

  function handleZoneDeleted(event: CustomEvent) {
    const deletedZone = event.detail;
    
    zones = zones.filter(zone => zone.id !== deletedZone.id);
    filterZones();
  }

  function handleOpenZonesModal() {
    zonesModalOpen = true;
  }
  
  function handleOpenRecordsModal(event: CustomEvent) {
    const { edit, record } = event.detail;
    openRecordsModal(edit, record);
  }
  
  function handleZoneSearchChange() {
    filterZones();
  }
  
  function handleRecordSearchChange() {
    filterRecords();
  }

  function parseTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  
  $: if (zoneSearchQuery !== undefined) {
    filterZones();
  }
  
  $: if (recordSearchQuery !== undefined) {
    filterRecords();
  }
</script>

<svelte:head>
  <title>Easy CloudFlare DDNS</title>
</svelte:head>

{#if initialLoading}
  <div class="initial-loading" class:dark-loading={document.documentElement.classList.contains('dark-theme')}>
    <Loader size="large" />
    <p>Loading data...</p>
  </div>
{:else}
  <div class="container">
    <div class="header-section">
      <div class="server-status">
        {#if serverStatus}
          <div class="status-section">
            <div class="status-header">
              <h3>Status</h3>
              <div class="status-info">
                <div class="status-item">
                  <span class="status-label">Public IP:</span>
                  <span class="status-value">{serverStatus.data.externalIp || 'Unknown'}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Next Check:</span>
                  <span class="status-value countdown">
                    {#if serverStatus.data.isIntervalPaused}
                      Paused
                    {:else}
                      {parseTime(countdownSeconds)}
                    {/if}
                  </span>
                </div>
              </div>
              <div class="status-controls">
                <button
                  class="status-button {serverStatus.data.isIntervalPaused ? 'start-button' : 'pause-button'}"
                  on:click={toggleCheckInterval}
                  disabled={togglingInterval}
                >
                  {#if togglingInterval}
                    <Loader size="small" color="white" />
                  {:else}
                    <Icon name={serverStatus.data.isIntervalPaused ? 'play' : 'pause'} />
                  {/if}
                  <span>{serverStatus.data.isIntervalPaused ? 'Start' : 'Pause'}</span>
                </button>
                
                <button 
                  class="status-button force-button" 
                  on:click={forceCheckInterval}
                  disabled={serverStatus.data.isIntervalPaused}
                >
                  <Icon name="fast-forward" />
                  <span>Force Check</span>
                </button>
                
                <button 
                  class="status-button update-button" 
                  on:click={handleForceCloudflareUpdate}
                  disabled={forcingCloudflareUpdate || records.length === 0}
                >
                  {#if forcingCloudflareUpdate}
                    <Loader size="small" color="white" />
                  {:else}
                    <Icon name="cloud" />
                  {/if}
                  <span>Force Update</span>
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div class="loading-indicator">
            <Loader size="small" />
            <span>Loading server status...</span>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="content-container">
      <ZonesTable 
        {zones}
        {filteredZones}
        loading={loading}
        error={error}
        {records}
        bind:zoneSearchQuery={zoneSearchQuery}
        on:openZonesModal={handleOpenZonesModal}
        on:filterZones={handleZoneSearchChange}
        on:zoneDeleted={handleZoneDeleted}
      />
      
      {#if zones.length > 0}
        <RecordsTable 
          {records}
          {filteredRecords}
          loading={loadingRecords}
          error={recordsError}
          bind:recordSearchQuery={recordSearchQuery}
          on:openRecordsModal={handleOpenRecordsModal}
          on:filterRecords={handleRecordSearchChange}
        />
      {/if}
    </div>
  </div>

  <ZonesModal 
    bind:open={zonesModalOpen} 
    on:zoneAdded={handleZoneAdded}
  />

  <RecordsModal 
    bind:open={recordsModalOpen}
    bind:editMode={recordEditMode}
    bind:recordToEdit={recordToEdit}
    on:recordAdded={handleRecordAdded}
    on:recordUpdated={handleRecordUpdated}
    on:recordDeleted={handleRecordDeleted}
  />

  <ConfigurationModal 
    bind:open={configModalOpen}
  />
{/if}

<style>
  .container {
    width: 100%;
    background-color: var(--card-bg);
    border-radius: 8px;
    padding: 24px;
    box-shadow: var(--shadow);
    margin-bottom: 24px;
    border: 1px solid var(--border-color);
    box-sizing: border-box;
  }
  
  .initial-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    width: 100%;
    color: var(--text-color);
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 24px;
  }
  
  .content-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .server-status {
    flex: 1;
    background-color: var(--card-hover);
    border-radius: 8px;
    border: 1px solid var(--border-color);
    overflow: hidden;
  }
  
  .status-section {
    width: 100%;
  }
  
  .status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: var(--card-header-bg);
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .status-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
    min-width: 70px;
  }
  
  .status-controls {
    display: flex;
    gap: 8px;
  }
  
  .status-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.8rem;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .start-button {
    background-color: var(--principal-orange);
    color: var(--text-color);
  }
  
  .start-button:hover:not(:disabled) {
    background-color: var(--principal-orange-dark);
  }
  
  .pause-button {
    background-color: var(--warning-color);
    color: var(--text-color);
    border: 1px solid rgba(0, 0, 0, 0.2);
    font-weight: 500;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  }
  
  .pause-button:hover:not(:disabled) {
    background-color: var(--warning-color-dark);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  
  .force-button {
    background-color: var(--principal-blue);
    color: var(--text-color);
  }
  
  .force-button:hover:not(:disabled) {
    background-color: var(--principal-blue-dark);
  }
  
  .force-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .update-button {
    background-color: var(--principal-orange);
    color: var(--text-color);
  }
  
  .update-button:hover:not(:disabled) {
    background-color: var(--principal-orange-dark);
  }
  
  .update-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .status-info {
    display: flex;
    flex: 1;
    gap: 16px;
    margin: 0 12px;
  }
  
  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .status-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--principal-blue);
  }
  
  .status-value {
    font-size: 0.9rem;
    color: var(--text-color);
    font-weight: 500;
  }
  
  .countdown {
    font-family: monospace;
  }
  
  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    width: 100%;
    color: var(--text-color);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .container {
      padding: 16px;
    }
    
    .header-section {
      flex-direction: column;
      align-items: stretch;
    }
    
    .status-header {
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .status-info {
      order: 3;
      width: 100%;
      margin: 0;
    }
  }
  
  @media (max-width: 480px) {
    .server-status {
      background-color: var(--card-hover);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .status-section {
      display: flex;
      flex-direction: column;
    }
    
    .status-header {
      flex-direction: column;
      align-items: flex-start;
      padding: 12px;
      gap: 12px;
    }
    
    .status-header h3 {
      font-size: 1.1rem;
      margin-bottom: 4px;
      width: 100%;
      display: flex;
      align-items: center;
    }
    
    .status-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      width: 100%;
      gap: 12px;
      padding: 4px 0 12px;
      border-bottom: 1px solid rgba(var(--border-color-rgb), 0.5);
    }
    
    .status-item {
      background-color: rgba(var(--card-bg-rgb), 0.5);
      padding: 8px 10px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    
    .status-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--principal-blue);
    }
    
    .status-value {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .status-controls {
      width: 100%;
      justify-content: space-between;
      padding-top: 8px;
    }
    
    .status-button {
      flex: 1;
      justify-content: center;
      padding: 8px 10px;
      font-weight: 500;
      border-radius: 6px;
    }
    
    .status-button span:last-child {
      font-size: 0.85rem;
    }
    
    .force-button {
      margin-left: 8px;
    }
  }
</style>

