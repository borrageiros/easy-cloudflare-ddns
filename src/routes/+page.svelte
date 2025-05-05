<script lang="ts">
  import ZonesModal from "$lib/components/ZonesModal.svelte";
  import RecordsModal from "$lib/components/RecordsModal.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { onMount, onDestroy } from "svelte";
  import { getZones, deleteZone, getRecords, deleteRecord, getServerStatus, toggleInterval, forceInterval } from "$lib/api";
  import type { DnsZone, DnsRecord, ServerStatusResponse } from "$lib/api";
  import { browser } from '$app/environment';
  
  let zonesModalOpen = false;
  let recordsModalOpen = false;
  let recordEditMode = false;
  let recordToEdit: DnsRecord | null = null;
  
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
  let deletingRecordId: string | null = null;
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

  async function loadServerStatus() {    
    try {
      const statusData = await getServerStatus();
      if (statusData) {
        serverStatus = statusData;
        
        // If paused and nextCheck is 0, set a minimum value
        // to avoid infinite requests
        if (statusData.isIntervalPaused && statusData.nextCheck <= 0) {
          countdownSeconds = 1;
        } else {
          countdownSeconds = statusData.nextCheck;
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
      } else if (!serverStatus?.isIntervalPaused) {
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
          isIntervalPaused: response.paused,
          nextCheck: response.nextCheck
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
          nextCheck: response.nextCheck
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
      filteredZones = zones;
      return;
    }
    
    const query = zoneSearchQuery.toLowerCase().trim();
    filteredZones = zones.filter(zone => 
      zone.name.toLowerCase().includes(query)
    );
  }
  
  function filterRecords() {
    if (!recordSearchQuery.trim()) {
      filteredRecords = records;
      return;
    }
    
    const query = recordSearchQuery.toLowerCase().trim();
    filteredRecords = records.filter(record => 
      record.name.toLowerCase().includes(query) || 
      (zones.find(z => z.id === record.zoneId)?.name || '').toLowerCase().includes(query)
    );
  }
  
  async function handleDeleteZone(id: string) {
    // Check if there are records associated with this zone
    if (records.some(record => record.zoneId === id)) {
      error = 'Cannot delete zone with associated records. Please delete the records first.';
      return;
    }
    
    deletingZoneId = id;
    
    try {
      const success = await deleteZone(id);
      
      if (success) {
        zones = zones.filter(zone => zone.id !== id);
        filterZones();
      } else {
        error = 'Failed to delete zone';
      }
    } catch (err) {
      console.error('Error deleting zone:', err);
      error = 'Error deleting zone';
    } finally {
      deletingZoneId = null;
    }
  }
  
  async function handleDeleteRecord(id: string) {
    deletingRecordId = id;
    
    try {
      const success = await deleteRecord(id);
      
      if (success) {
        records = records.filter(record => record.id !== id);
        filterRecords();
      } else {
        recordsError = 'Failed to delete record';
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      recordsError = 'Error deleting record';
    } finally {
      deletingRecordId = null;
    }
  }
  
  function handleEditRecord(record: DnsRecord) {
    openRecordsModal(true, record);
  }
  
  onMount(() => {
    loadZones();
    loadRecords();
    loadServerStatus();
    
    // Configure the event listener for when the configuration is updated
    if (browser) {
      window.addEventListener('config-updated', handleConfigUpdate);
    }
  });
  
  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    
    // Remove the event listener when the component is destroyed
    if (browser) {
      window.removeEventListener('config-updated', handleConfigUpdate);
    }
  });
  
  function handleZonesModalClose() {
    loadZones();
  }
  
  function handleRecordsModalClose() {
    loadRecords();
  }

  function handleZoneAdded(event: CustomEvent<DnsZone>) {
    const newZone = event.detail;
    zones = [...zones, newZone];
    filterZones();
  }
  
  function handleRecordAdded(event: CustomEvent<DnsRecord>) {
    const newRecord = event.detail;
    records = [...records, newRecord];
    filterRecords();
  }
  
  function handleRecordUpdated(event: CustomEvent<DnsRecord>) {
    const updatedRecord = event.detail;
    records = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
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
  
  // Filter when search queries change
  $: if (zoneSearchQuery !== undefined) {
    filterZones();
  }
  
  $: if (recordSearchQuery !== undefined) {
    filterRecords();
  }

  // Function that executes when the configuration has been updated
  function handleConfigUpdate() {
    console.log('Configuration updated, reloading server status...');
    loadServerStatus();
  }
</script>

<svelte:head>
  <title>Easy CloudFlare DDNS</title>
</svelte:head>

<div class="container">
  {#if serverStatus}
    <div class="server-status">
      <div class="status-row">
        <div class="status-item ip-item">
          <p><span style="color: var(--principal-blue);">IP:</span> {serverStatus.externalIp}</p>
        </div>
        <div class="status-item check-item">
          <p>
            <span style="color: var(--principal-blue);">Next check:</span> 
            {serverStatus.isIntervalPaused ? 'Paused' : countdownSeconds > 0 ? parseTime(countdownSeconds) : 'Checking...'}
          </p>
        </div>
        <div class="status-item button-item">
          <button 
            class="toggle-button" 
            on:click={toggleCheckInterval}
            class:paused={serverStatus.isIntervalPaused}
            title={serverStatus.isIntervalPaused ? "Resume interval" : "Pause interval"}
          >
            <Icon name={serverStatus.isIntervalPaused ? "play" : "pause"} />
            <span>{serverStatus.isIntervalPaused ? "Resume" : "Pause"}</span>
          </button>
        </div>
        <div class="status-item button-item">
          <button 
            class="toggle-button" 
            on:click={forceCheckInterval}
            title="Force interval"
          >
            <Icon name="fast-forward" />
            <span>Force check</span>
          </button>
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

<div class="container">
  <div class="header-section">
    <h2>Zones</h2>
    <button class="add-button" on:click={openZonesModal}>
      <Icon name="plus" />
      <span>Add Zone</span>
    </button>
  </div>
  
  <div class="content-section">
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
    
    {#if loading}
      <div class="loading-indicator">
        <span class="spinner"></span>
        <span>Loading zones...</span>
      </div>
    {:else if zones.length === 0}
      <div class="empty-state">
        <Icon name="database" />
        <p>No zones found. Click the "Add Zone" button to add one.</p>
      </div>
    {:else}
      <div class="search-container">
        <div class="search-input-wrapper">
          <Icon name="search" />
          <input 
            type="text" 
            bind:value={zoneSearchQuery} 
            placeholder="Search zones..."
            class="search-input"
          />
          {#if zoneSearchQuery}
            <button 
              class="clear-search-button" 
              on:click={() => zoneSearchQuery = ''}
              title="Clear search"
            >
              <Icon name="x" />
            </button>
          {/if}
        </div>
        {#if filteredZones.length !== zones.length}
          <div class="search-info">
            Showing {filteredZones.length} of {zones.length} zones
          </div>
        {/if}
      </div>
      
      <div class="zones-list">
        <div class="zones-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Records</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredZones as zone}
                <tr>
                  <td>{zone.name}</td>
                  <td>{new Date(zone.createdAt).toLocaleDateString()}</td>
                  <td class="records-count">
                    {records.filter(record => record.zoneId === zone.id).length}
                  </td>
                  <td>
                    <button 
                      class="delete-button" 
                      on:click={() => handleDeleteZone(zone.id)}
                      disabled={deletingZoneId === zone.id || records.some(record => record.zoneId === zone.id)}
                      title={records.some(record => record.zoneId === zone.id) ? 'Cannot delete zone with associated records' : 'Delete zone'}
                    >
                      {#if deletingZoneId === zone.id}
                        <span class="spinner-small"></span>
                      {:else}
                        <Icon name="trash" />
                      {/if}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

{#if zones.length > 0}
<div class="container">
  <div class="header-section">
    <h2>Records</h2>
    <button class="add-button" on:click={() => openRecordsModal()}>
      <Icon name="plus" />
      <span>Add Record</span>
    </button>
  </div>
  
  <div class="content-section">
    {#if recordsError}
      <div class="error-message">
        {recordsError}
      </div>
    {/if}
    
    {#if loadingRecords}
      <div class="loading-indicator">
        <span class="spinner"></span>
        <span>Loading records...</span>
      </div>
    {:else if records.length === 0}
      <div class="empty-state">
        <Icon name="database" />
        <p>No DNS records found. Click the "Add Record" button to add one.</p>
      </div>
    {:else}
      <div class="search-container">
        <div class="search-input-wrapper">
          <Icon name="search" />
          <input 
            type="text" 
            bind:value={recordSearchQuery} 
            placeholder="Search records..."
            class="search-input"
          />
          {#if recordSearchQuery}
            <button 
              class="clear-search-button" 
              on:click={() => recordSearchQuery = ''}
              title="Clear search"
            >
              <Icon name="x" />
            </button>
          {/if}
        </div>
        {#if filteredRecords.length !== records.length}
          <div class="search-info">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        {/if}
      </div>
      
      <div class="records-list">
        <div class="records-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>TTL</th>
                <th>Proxied</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredRecords as record}
                <tr>
                  <td>{record.name}</td>
                  <td>{parseTTL(record.ttl)}</td>
                  <td>
                    <span class="status-badge {record.proxied ? 'active' : 'inactive'}">
                      {record.proxied ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td class="action-buttons-cell">
                    <button 
                      class="edit-button" 
                      on:click={() => handleEditRecord(record)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button 
                      class="delete-button" 
                      on:click={() => handleDeleteRecord(record.id)}
                      disabled={deletingRecordId === record.id}
                    >
                      {#if deletingRecordId === record.id}
                        <span class="spinner-small"></span>
                      {:else}
                        <Icon name="trash" />
                      {/if}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>
{/if}

<ZonesModal 
  bind:open={zonesModalOpen} 
  on:close={handleZonesModalClose}
  on:zoneAdded={handleZoneAdded}
/>

<RecordsModal 
  bind:open={recordsModalOpen}
  bind:editMode={recordEditMode}
  bind:recordToEdit={recordToEdit}
  on:close={handleRecordsModalClose}
  on:recordAdded={handleRecordAdded}
  on:recordUpdated={handleRecordUpdated}
/>

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
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  h2 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.5rem;
  }
  
  .add-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--principal-orange);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .add-button:hover {
    background-color: var(--principal-blue);
  }
  
  .content-section {
    color: var(--text-color-secondary);
  }
  
  .search-container {
    margin-bottom: 16px;
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-input-wrapper :global(svg) {
    position: absolute;
    left: 10px;
    width: 16px;
    height: 16px;
    color: var(--text-color-secondary);
  }
  
  .search-input {
    width: 100%;
    padding: 8px 36px 8px 32px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  .clear-search-button {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .clear-search-button:hover {
    color: var(--text-color);
  }
  
  .search-info {
    margin-top: 8px;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-color);
    font-size: 0.875rem;
    padding: 16px 0;
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
  
  .spinner-small {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: currentColor;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error-message {
    color: var(--error-color);
    padding: 8px;
    border: 1px solid var(--error-color);
    border-radius: 4px;
    background-color: rgba(255, 0, 0, 0.05);
    font-size: 0.875rem;
    margin-bottom: 16px;
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
  
  .zones-table, .records-table {
    width: 100%;
    overflow-x: auto;
  }
  
  /* Estilos específicos para la tabla de zonas */
  .zones-table table {
    table-layout: fixed;
  }
  
  .zones-table th:nth-child(1), 
  .zones-table td:nth-child(1) {
    width: 50%;
  }
  
  .zones-table th:nth-child(2), 
  .zones-table td:nth-child(2) {
    width: 20%;
  }
  
  .zones-table th:nth-child(3), 
  .zones-table td:nth-child(3) {
    width: 15%;
    text-align: center;
  }
  
  .zones-table th:nth-child(4), 
  .zones-table td:nth-child(4) {
    width: 15%;
    text-align: center;
  }
  
  /* Styles for the records table */
  .records-table table {
    min-width: 600px; /* Ensure minimum width to avoid compression */
  }
  
  /* Column distribution for the records table */
  .records-table th:nth-child(1),
  .records-table td:nth-child(1) {
    width: 35%; /* Increased for Name */
  }
  
  .records-table th:nth-child(2),
  .records-table td:nth-child(2) {
    width: 20%; /* For TTL */
  }
  
  .records-table th:nth-child(3),
  .records-table td:nth-child(3) {
    width: 15%; /* For Proxied */
    text-align: center;
  }
  
  .records-table th:nth-child(4),
  .records-table td:nth-child(4) {
    width: 15%; /* For Created - Reduced to give more space to Actions */
  }
  
  .records-table th:nth-child(5),
  .records-table td:nth-child(5) {
    width: 15%; /* For Actions - Increased */
    min-width: 100px; /* Ensure minimum space for buttons */
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 100%;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 500;
    color: var(--text-color);
    background-color: var(--background-color);
  }
  
  th:last-child {
    position: sticky;
    right: 0;
    background-color: var(--background-color);
    z-index: 10;
  }
  
  tr:hover {
    background-color: var(--card-hover);
  }
  
  .records-count {
    font-weight: 500;
  }
  
  .status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-badge.active {
    background-color: rgba(0, 255, 0, 0.1);
    color: var(--success-color);
  }
  
  .status-badge.inactive {
    background-color: rgba(255, 0, 0, 0.1);
    color: var(--error-color);
  }
  
  .action-buttons-cell {
    display: flex;
    gap: 8px;
    position: sticky;
    right: 0;
    background-color: var(--card-bg);
    padding-left: 8px;
    z-index: 10;
    justify-content: center; /* Centra los botones */
  }
  
  .delete-button, .edit-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
    min-width: 32px; /* Ancho mínimo para los botones */
    min-height: 32px; /* Altura mínima para los botones */
    padding: 6px; /* Padding adicional */
  }
  
  .delete-button {
    color: var(--error-color);
  }
  
  .edit-button {
    color: var(--principal-blue);
  }
  
  .delete-button:hover:not(:disabled) {
    background-color: rgba(255, 0, 0, 0.1);
  }
  
  .edit-button:hover {
    background-color: rgba(0, 0, 255, 0.1);
  }
  
  .delete-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .server-status {
    margin-top: 16px;
  }
  
  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
  }
  
  .status-item {
    flex: 1;
    min-width: 150px;
    display: flex;
    align-items: center;
  }
  
  .status-item p {
    margin: 0;
    width: 100%;
  }
  
  .status-item span {
    font-weight: bold;
  }
  
  .ip-item {
    flex: 1;
  }
  
  .check-item {
    flex: 2;
  }
  
  .button-item {
    flex: 1;
    justify-content: flex-end;
    display: flex;
    align-items: center;
  }
  
  .toggle-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    transition: background-color 0.2s;
    background-color: var(--principal-blue);
    color: white;
    max-width: 120px;
    min-width: 80px;
    height: 32px;
  }
  
  .toggle-button:hover {
    background-color: var(--principal-orange);
  }
  
  .toggle-button.paused {
    background-color: var(--principal-orange);
  }
  
  .toggle-button.paused:hover {
    background-color: var(--principal-blue);
  }
  
  .toggle-button :global(svg) {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  .toggle-button span {
    white-space: nowrap;
    font-size: 0.8rem;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .container {
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .header-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .zones-table, .records-table {
      font-size: 0.9rem;
    }
    
    th, td {
      padding: 8px;
    }
    
    .action-buttons-cell {
      display: flex;
      flex-wrap: nowrap;
    }
    
    .toggle-button {
      padding: 6px 12px;
      max-width: 150px;
      height: 36px;
      font-size: 0.85rem;
    }
    
    .toggle-button :global(svg) {
      width: 18px;
      height: 18px;
    }
    
    .toggle-button span {
      font-size: 0.85rem;
    }
  }
  
  @media (max-width: 640px) {
    .status-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      align-items: center;
    }
    
    .status-item {
      width: 100%;
      justify-content: flex-start;
      margin-bottom: 4px;
    }
    
    .ip-item, .check-item {
      grid-column: span 1;
    }
    
    .status-item p {
      display: flex;
      flex-direction: column;
    }
    
    .button-item {
      min-width: auto;
      justify-content: center;
    }
    
    .toggle-button {
      width: 100%;
      max-width: 100%;
      justify-content: center;
      padding: 8px;
      height: 40px;
    }
    
    .toggle-button span {
      display: none;
    }
    
    .toggle-button :global(svg) {
      width: 20px;
      height: 20px;
      margin: 0 auto;
    }
    
    .add-button span {
      display: none;
    }
    
    .add-button {
      padding: 8px;
    }
    
    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
      width: 100%;
    }
    
    /* Ajustes específicos para la tabla de zonas en móviles */
    .zones-table table {
      min-width: auto;
      table-layout: auto;
    }
    
    /* Ajustes específicos para la tabla de registros en móviles */
    .records-table table {
      min-width: 500px;
    }
    
    /* Asegurar que la columna de acciones sea visible */
    th:last-child, td:last-child {
      position: sticky;
      right: 0;
      z-index: 10;
    }
    
    td:last-child {
      background-color: var(--card-bg);
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    }
    
    th:last-child {
      background-color: var(--background-color);
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    }
  }
  
  @media (max-width: 480px) {
    .container {
      padding: 12px;
      margin-bottom: 12px;
      border-radius: 6px;
    }
    
    h2 {
      font-size: 1.2rem;
    }
    
    .zones-table, .records-table {
      font-size: 0.8rem;
    }
    
    th, td {
      padding: 6px 4px;
    }
    
    td:last-child {
      padding-left: 4px;
      padding-right: 4px;
    }
    
    .action-buttons-cell {
      gap: 4px;
    }
    
    /* Reducir el ancho mínimo en teléfonos muy pequeños */
    .records-table table {
      min-width: 450px;
    }
    
    .status-row {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .ip-item p, .check-item p {
      flex-direction: row;
      align-items: center;
      gap: 5px;
    }
    
    .status-item p {
      font-size: 0.9rem;
    }
    
    .status-item span {
      font-size: 0.9rem;
    }
    
    .toggle-button {
      padding: 8px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .toggle-button :global(svg) {
      margin: 0;
    }
  }
</style>

