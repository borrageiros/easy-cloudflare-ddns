<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import { getZones, createRecord, updateRecord, getCloudFlareRecords, getRecords, deleteRecord } from '$lib/api';
  import type { DnsZone, DnsRecord, CloudFlareDnsRecord } from '$lib/api';
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import Loader from '$lib/components/Loader.svelte';
  
  export let open = false;
  export let editMode = false;
  export let recordToEdit: DnsRecord | null = null;
  
  const dispatch = createEventDispatcher();
  
  let loading = false;
  let saving = false;
  let deleting = false;
  let zones: DnsZone[] = [];
  let cloudflareRecords: CloudFlareDnsRecord[] = [];
  let databaseRecords: DnsRecord[] = [];
  let filteredRecords: CloudFlareDnsRecord[] = [];
  let displayedRecords: CloudFlareDnsRecord[] = [];
  let error = '';
  let success = '';
  let searchQuery = '';
  
  let selectedZone: DnsZone | null = null;
  let selectedRecord: CloudFlareDnsRecord | null = null;
  let ttl = 1;
  let proxied = false;
  
  // Reference to the search input for focus
  let searchInputElement: HTMLInputElement;
  
  // TTL options based on CloudFlare standard values
  const ttlOptions = [
    { label: 'Auto', value: 1 },
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
    { label: '30 min', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: '2 hours', value: 7200 },
    { label: '5 hours', value: 18000 },
    { label: '12 hours', value: 43200 },
    { label: '1 day', value: 86400 }
  ];
  
  function closeModal() {
    open = false;
    resetForm();
  }
  
  function resetForm() {
    error = '';
    success = '';
    selectedZone = null;
    selectedRecord = null;
    ttl = 1;
    proxied = false;
    editMode = false;
    recordToEdit = null;
    searchQuery = '';
  }
  
  async function loadZones() {
    loading = true;
    error = '';
    success = '';
    
    try {
      const zonesData = await getZones();
      
      if (zonesData && zonesData.length > 0) {
        zones = zonesData;
        selectedZone = zonesData[0];
        
        if (selectedZone) {
          await loadRecords(selectedZone.id);
        }
      } else {
        error = 'No zones found. Please add a zone first.';
        zones = [];
      }
    } catch (err) {
      console.error('Error loading zones:', err);
      error = 'Error loading zones';
      zones = [];
    } finally {
      loading = false;
      
      // Set focus on search input after loading is complete and in create mode
      if (!editMode && searchInputElement && !loading) {
        setTimeout(() => {
          searchInputElement.focus();
        }, 100);
      }
    }
  }
  
  async function loadRecords(zoneId: string) {
    loading = true;
    error = '';
    searchQuery = '';
    
    try {
      // Load CloudFlare and database records
      const [recordsData, dbRecords] = await Promise.all([
        getCloudFlareRecords(zoneId),
        getRecords()
      ]);
      
      if (recordsData && recordsData.length > 0) {
        cloudflareRecords = recordsData;
        
        // Save database records
        databaseRecords = dbRecords || [];
        
        // Filter CloudFlare records that are not in the database
        filteredRecords = cloudflareRecords.filter(cfRecord => 
          !databaseRecords.some(dbRecord => 
            dbRecord.id === cfRecord.id && dbRecord.zoneId === zoneId
          )
        );
        
        displayedRecords = [...filteredRecords];
        
        if (filteredRecords.length === 0) {
          error = 'No more records available to add in this zone';
          selectedRecord = null;
        } else {
          selectedRecord = filteredRecords[0];
          ttl = selectedRecord.ttl;
          proxied = selectedRecord.proxied;
        }
      } else {
        cloudflareRecords = [];
        filteredRecords = [];
        displayedRecords = [];
        selectedRecord = null;
        error = 'No DNS records found for this zone';
      }
    } catch (err) {
      console.error('Error loading records:', err);
      error = 'Error loading DNS records';
      cloudflareRecords = [];
      filteredRecords = [];
      displayedRecords = [];
      selectedRecord = null;
    } finally {
      loading = false;
    }
  }
  
  function filterRecords() {
    if (!searchQuery.trim()) {
      displayedRecords = filteredRecords;
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    displayedRecords = filteredRecords.filter(record => 
      record.name.toLowerCase().includes(query) || 
      record.type.toLowerCase().includes(query) ||
      (record.content && record.content.toLowerCase().includes(query))
    );
    
    // If current selection is not in filtered list and there are results, select first result
    if (displayedRecords.length > 0 && selectedRecord) {
      const isCurrentSelectionInResults = displayedRecords.some(r => r.id === selectedRecord?.id);
      if (!isCurrentSelectionInResults) {
        const newSelection = displayedRecords[0];
        selectedRecord = newSelection;
        ttl = newSelection.ttl;
        proxied = newSelection.proxied;
      }
    }
  }
  
  async function handleSave() {
    if (!editMode && !selectedZone) {
      error = 'Please select a zone first';
      return;
    }
    
    if (!editMode && !selectedRecord) {
      error = 'Please select a record first';
      return;
    }
    
    saving = true;
    error = '';
    success = '';
    
    try {
      if (editMode && recordToEdit) {
        // Update existing record
        const updates = {
          ttl: proxied ? 1 : ttl, // If proxied, force TTL to Auto (1)
          proxied: proxied
        };
        
        const updatedRecord = await updateRecord(recordToEdit.id, updates);
        
        if (updatedRecord) {
          success = `Record "${recordToEdit.name}" updated successfully`;
          dispatch('recordUpdated', updatedRecord);
          setTimeout(() => {
            closeModal();
          }, 2000);
        } else {
          error = 'Failed to update record';
        }
      } else if (selectedRecord && selectedZone) {
        // Create new record
        const recordData = {
          id: selectedRecord.id,
          name: selectedRecord.name,
          type: selectedRecord.type,
          content: selectedRecord.content,
          ttl: proxied ? 1 : ttl, // If proxied, force TTL to Auto (1)
          proxied: proxied,
          zoneId: selectedZone.id
        };
        
        const savedRecord = await createRecord(recordData);
        
        if (savedRecord) {
          success = `Record "${selectedRecord.name}" saved successfully`;
          dispatch('recordAdded', savedRecord);
          
          // Update the lists of records after saving
          databaseRecords = [...databaseRecords, savedRecord];
          filteredRecords = filteredRecords.filter(record => record.id !== selectedRecord?.id);
          displayedRecords = displayedRecords.filter(record => record.id !== selectedRecord?.id);
          
          if (filteredRecords.length > 0) {
            selectedRecord = filteredRecords[0];
            ttl = selectedRecord.ttl;
            proxied = selectedRecord.proxied;
          } else {
            selectedRecord = null;
            error = 'No more records available to add in this zone';
          }
          
          setTimeout(() => {
            closeModal();
          }, 2000);
        } else {
          error = 'Failed to save record';
        }
      }
    } catch (err) {
      console.error('Error saving record:', err);
      error = 'Error saving record';
    } finally {
      saving = false;
    }
  }
  
  async function handleDelete() {
    if (!editMode || !recordToEdit) {
      error = 'No record to delete';
      return;
    }
    
    deleting = true;
    error = '';
    success = '';
    
    try {
      const deleteSuccess = await deleteRecord(recordToEdit.id);
      
      if (deleteSuccess) {
        success = `Record "${recordToEdit.name}" deleted successfully`;
        dispatch('recordDeleted', recordToEdit);
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        error = 'Failed to delete record';
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      error = 'Error deleting record';
    } finally {
      deleting = false;
    }
  }
  
  function handleZoneChange() {
    if (selectedZone) {
      loadRecords(selectedZone.id);
    }
  }
  
  function handleRecordChange() {
    if (selectedRecord) {
      ttl = selectedRecord.ttl;
      proxied = selectedRecord.proxied;
    }
  }
  
  function handleProxiedChange() {
    if (proxied) {
      // When proxied is enabled, TTL should be set to Auto (1)
      ttl = 1;
    }
  }
  
  // Init form when opening in edit mode
  function initEditMode() {
    if (editMode && recordToEdit) {
      ttl = recordToEdit.ttl || 1;
      proxied = recordToEdit.proxied || false;
    }
  }
  
  // Find closest TTL value in options or default to Auto
  function getNearestTtlOption(value: number): number {
    const option = ttlOptions.find(opt => opt.value === value);
    if (option) return option.value;
    
    // Find closest value
    const closest = ttlOptions.reduce((prev, curr) => {
      return (Math.abs(curr.value - value) < Math.abs(prev.value - value)) ? curr : prev;
    });
    
    return closest.value;
  }
  
  // When TTL changes from external source, ensure it matches an option
  $: if (ttl) {
    const nearestTtl = getNearestTtlOption(ttl);
    if (ttl !== nearestTtl) {
      ttl = nearestTtl;
    }
  }
  
  // Filter records when search query changes
  $: if (searchQuery !== undefined) {
    filterRecords();
  }
  
  $: if (open && !editMode) {
    loadZones();
  }
  
  $: if (open && editMode && recordToEdit) {
    initEditMode();
  }
</script>

<Modal title={editMode ? "Edit Record" : "Add new Record"} {open} on:close={closeModal}>
  <div class="records-manager">
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
        <span>Loading...</span>
      </div>
    {:else}
      <div class="records-form">
        {#if !editMode}
          <div class="form-group">
            <label for="zone-select">Zone</label>
            <select 
              id="zone-select"
              bind:value={selectedZone}
              on:change={handleZoneChange}
              disabled={saving || zones.length === 0}
            >
              {#each zones as zone}
                <option value={zone}>{zone.name}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="record-search">Search DNS Records</label>
            <div class="search-container">
              <input 
                id="record-search"
                type="text" 
                bind:value={searchQuery}
                bind:this={searchInputElement}
                placeholder="Search records..."
                disabled={saving || filteredRecords.length === 0}
              />
              <button class="clear-search" on:click={() => searchQuery = ''} disabled={!searchQuery}>
                <Icon name="x" />
              </button>
            </div>
            
            <div class="record-info">
              {#if displayedRecords.length !== filteredRecords.length}
                <small>Showing {displayedRecords.length} of {filteredRecords.length} records</small>
              {:else if filteredRecords.length !== cloudflareRecords.length}
                <small>Showing {filteredRecords.length} of {cloudflareRecords.length} available records (excluding {cloudflareRecords.length - filteredRecords.length} already added)</small>
              {:else}
                <small>Total records: {filteredRecords.length}</small>
              {/if}
            </div>
            
            <label for="record-select">DNS Record</label>
            <select 
              id="record-select"
              bind:value={selectedRecord} 
              on:change={handleRecordChange}
              disabled={saving || displayedRecords.length === 0}
              size={displayedRecords.length > 10 ? 10 : displayedRecords.length || 1}
              class="record-select"
            >
              {#each displayedRecords as record}
                <option value={record}>{record.name}</option>
              {/each}
            </select>
          </div>
        {:else if recordToEdit}
          <div class="record-details">
            <div class="detail-item">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{recordToEdit.name}</span>
            </div>
          </div>
        {/if}
        
        <div class="form-group checkbox-group">
          <span class="icon-cloud">
            <Icon name="cloud" />
            <label for="proxied-input">Proxied</label>
          </span>
          <input 
            id="proxied-input"
            type="checkbox" 
            bind:checked={proxied}
            on:change={handleProxiedChange}
            disabled={saving || deleting}
          />
        </div>
        
        <div class="form-group">
          <label for="ttl-select">TTL</label>
          <select 
            id="ttl-select"
            bind:value={ttl}
            disabled={saving || deleting || proxied}
            class={proxied ? 'disabled' : ''}
          >
            {#each ttlOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          {#if proxied}
            <small class="ttl-notice">TTL is set to Auto when Proxied is enabled</small>
          {/if}
        </div>
      </div>
    {/if}
    
    <div class="action-buttons">
      {#if editMode && recordToEdit}
        <button 
          class="delete-button" 
          on:click={handleDelete}
          disabled={loading || saving || deleting}
        >
          {#if deleting}
            <Loader size="small" />
          {:else}
            <Icon name="trash" />
          {/if}
          Delete Record
        </button>
      {/if}
      
      <div class="right-buttons">
        <button 
          class="save-button" 
          on:click={handleSave}
          disabled={loading || saving || deleting || (!editMode && (!selectedRecord || !selectedZone))}
        >
          {#if saving}
            <Loader size="small" />
          {:else}
            <Icon name="save" />
          {/if}
          {editMode ? 'Update' : 'Save'} Record
        </button>
        
        <button 
          class="close-button" 
          on:click={closeModal}
          disabled={saving || deleting}
        >
          <Icon name="x" />
          Close
        </button>
      </div>
    </div>
  </div>
</Modal>

<style>
  .records-manager {
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
  
  .records-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
  }
  
  .form-group select,
  .form-group input[type="text"] {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--background-color);
    color: var(--text-color);
    font-size: 0.875rem;
  }
  
  .form-group .record-select {
    height: auto;
  }


  .icon-cloud {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--principal-orange);
  }
  
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-container input {
    flex: 1;
    padding-right: 36px;
  }
  
  .clear-search {
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
  
  .clear-search:hover:not(:disabled) {
    color: var(--text-color);
  }
  
  .clear-search:disabled {
    opacity: 0;
    cursor: default;
  }
  
  .record-info {
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    margin-top: -4px;
    margin-bottom: 4px;
  }
  
  .form-group select.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--card-bg);
  }
  
  .ttl-notice {
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    margin-top: 4px;
  }
  
  .checkbox-group {
    flex-direction: row;
    align-items: center;
  }
  
  .checkbox-group input {
    margin-left: 8px;
  }
  
  .record-details {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 16px;
    background-color: var(--card-bg);
    margin-bottom: 16px;
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
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
  }
  
  .right-buttons {
    display: flex;
    gap: 8px;
  }
  
  .save-button, .close-button, .delete-button {
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
  
  .delete-button {
    background-color: var(--error-color);
    color: var(--text-color);
  }
  
  .delete-button:hover:not(:disabled) {
    background-color: var(--error-color-dark);
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
    
    .save-button, .close-button, .delete-button {
      padding: 8px 12px;
      font-size: 0.8rem;
    }
    
    .form-group label {
      font-size: 0.8rem;
    }
    
    .record-select {
      max-height: 180px;
    }
  }
  
  @media (max-width: 480px) {
    .action-buttons {
      flex-direction: column;
      gap: 12px;
    }
    
    .delete-button {
      width: 100%;
    }
    
    .right-buttons {
      justify-content: space-between;
      width: 100%;
    }
    
    .save-button, .close-button {
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
    
    .checkbox-group {
      flex-direction: row;
      justify-content: space-between;
    }
  }
</style> 