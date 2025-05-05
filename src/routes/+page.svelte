<script lang="ts">
  import ZonesModal from "$lib/components/ZonesModal.svelte";
  import RecordsModal from "$lib/components/RecordsModal.svelte";
  import ConfigurationModal from "$lib/components/ConfigurationModal.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import ZonesTable from "$lib/components/ZonesTable.svelte";
  import RecordsTable from "$lib/components/RecordsTable.svelte";
  import { onMount, onDestroy } from "svelte";
  import { getZones, deleteZone, getRecords, getServerStatus, toggleInterval, forceInterval, getUserConfig, isAuthenticated } from "$lib/api";
  import type { DnsZone, DnsRecord, ServerStatusResponse } from "$lib/api";
  import { browser } from '$app/environment';
  
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
  
  // Countdown timer variables
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let countdownSeconds = 0;

  function openZonesModal() {
    zonesModalOpen = true;
  }
  
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

  // Handle config updates
  function handleConfigUpdated() {
    // Reload the server status and other data after config update
    loadServerStatus();
    loadZones();
    loadRecords();
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
      } else {
        serverStatus = null;
      }
    } catch (err) {
      console.error('Error loading server status:', err);
      serverStatus = null;
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
  
  
  async function loadZones() {
    loading = true;
    error = '';
    
    try {
      const zonesData = await getZones();
      if (zonesData) {
        zones = zonesData;
        filterZones();
      } else {
        zones = [];
        filteredZones = [];
        error = 'Failed to load zones';
      }
    } catch (err) {
      console.error('Error loading zones:', err);
      error = 'Error loading zones';
      zones = [];
      filteredZones = [];
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
      } else {
        records = [];
        filteredRecords = [];
        recordsError = 'Failed to load records';
      }
    } catch (err) {
      console.error('Error loading records:', err);
      recordsError = 'Error loading records';
      records = [];
      filteredRecords = [];
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
  
  async function handleDeleteZone(zoneId: string) {
    if (!zoneId) return;
    
    deletingZoneId = zoneId;
    
    deleteZone(zoneId)
      .then((success) => {
        if (success) {
          // Remove the zone from the list
          zones = zones.filter(zone => zone.id !== zoneId);
          filterZones();
          
          // Remove any records associated with this zone
          records = records.filter(record => record.zoneId !== zoneId);
          filterRecords();
        } else {
          console.error('Failed to delete zone');
        }
      })
      .catch((err) => {
        console.error('Error deleting zone:', err);
      })
      .finally(() => {
        deletingZoneId = null;
      });
  }
  
  function handleEditRecord(record: DnsRecord) {
    openRecordsModal(true, record);
  }
  
  onMount(async () => {
    if (browser) {
      // Verificar si el usuario está autenticado
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        window.location.href = '/login';
        return;
      }
      
      // Cargar los datos iniciales
      await Promise.all([
        loadZones(),
        loadRecords(),
        loadServerStatus(),
        checkUserConfig()
      ]);
      
      // Cambiar el estado de carga inicial
      initialLoading = false;
    }
  });
  
  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });
  
  function handleZonesModalClose() {
    loadZones();
  }
  
  function handleRecordsModalClose() {
    loadRecords();
  }

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
  
  function parseTTL(seconds: number): string {
    if (seconds === 1) {
      return 'Auto';
    }
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const parts = [];
    if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    if (seconds || parts.length === 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

    return parts.join(', ');
  }

  function parseTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
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
  <div class="initial-loading">
    <span class="spinner-large"></span>
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
              <div class="status-controls">
                <button
                  class="status-button {serverStatus.data.isIntervalPaused ? 'start-button' : 'pause-button'}"
                  on:click={toggleCheckInterval}
                  disabled={togglingInterval}
                >
                  {#if togglingInterval}
                    <span class="spinner-small white"></span>
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
              </div>
            </div>
            
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
                    {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
                  {/if}
                </span>
              </div>
            </div>
          </div>
        {:else}
          <div class="loading-indicator">
            <span class="spinner"></span>
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
        on:zoneDeleted={handleZoneAdded}
      />
      
      <RecordsTable 
        {records}
        {filteredRecords}
        loading={loadingRecords}
        error={recordsError}
        bind:recordSearchQuery={recordSearchQuery}
        on:openRecordsModal={handleOpenRecordsModal}
        on:filterRecords={handleRecordSearchChange}
      />
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
    on:configUpdated={handleConfigUpdated}
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
    color: var(--text-color-secondary);
  }
  
  .spinner-large {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--text-color-rgb), 0.3);
    border-radius: 50%;
    border-top-color: var(--principal-orange);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 1rem;
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
  }
  
  .status-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
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
    background-color: var(--success-color);
    color: white;
  }
  
  .start-button:hover:not(:disabled) {
    background-color: var(--success-color-dark);
  }
  
  .pause-button {
    background-color: var(--warning-color);
    color: white;
  }
  
  .pause-button:hover:not(:disabled) {
    background-color: var(--warning-color-dark);
  }
  
  .force-button {
    background-color: var(--principal-blue);
    color: white;
  }
  
  .force-button:hover:not(:disabled) {
    background-color: var(--principal-blue-dark);
  }
  
  .force-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .status-info {
    padding: 16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .status-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .status-label {
    font-size: 0.75rem;
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
  
  .spinner-small {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
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
  }
</style>

