<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { deleteZone } from "$lib/api";
  import type { DnsZone, DnsRecord } from "$lib/api";
  import { createEventDispatcher } from "svelte";
  import Loader from "$lib/components/Loader.svelte";
  
  export let zones: DnsZone[] = [];
  export let filteredZones: DnsZone[] = [];
  export let loading: boolean = false;
  export let error: string = '';
  export let zoneSearchQuery: string = '';
  export let records: DnsRecord[] = [];
  
  const dispatch = createEventDispatcher();
  
  let deletingZoneId: string | null = null;
  
  function openZonesModal() {
    dispatch('openZonesModal');
  }
  
  async function handleDeleteZone(zone: DnsZone) {
    if (!zone.id) return;
    
    // Check if there are records associated with this zone
    if (records.some(record => record.zoneId === zone.id)) {
      error = 'Cannot delete a zone with associated records. Delete the records first.';
      return;
    }
    
    deletingZoneId = zone.id;
    
    try {
      const success = await deleteZone(zone.id);
      
      if (success) {
        dispatch('zoneDeleted', zone);
      } else {
        console.error('Failed to delete zone');
      }
    } catch (err) {
      console.error('Error deleting zone:', err);
    } finally {
      deletingZoneId = null;
    }
  }
  
  function filterZones() {
    dispatch('filterZones');
  }
  
  $: if (zoneSearchQuery !== undefined) {
    filterZones();
  }
</script>

<div class="zones-section">
  <div class="section-header">
    <h2>Zones</h2>
    <div class="actions">
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search zones..." 
          bind:value={zoneSearchQuery}
          disabled={loading || zones.length === 0}
        />
        <button class="clear-search" on:click={() => zoneSearchQuery = ''} disabled={!zoneSearchQuery}>
          <Icon name="x" />
        </button>
      </div>
      <button class="add-button" on:click={openZonesModal}>
        <Icon name="plus" />
        <span>Add Zone</span>
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="error-message">
      {error}
    </div>
  {/if}
  
  {#if loading}
    <div class="loading-indicator">
      <Loader size="small" />
      <span>Loading zones...</span>
    </div>
  {:else if zones.length === 0}
    <div class="empty-state">
      <p>No zones found. Add a zone to get started.</p>
      <button class="add-button" on:click={openZonesModal}>
        <Icon name="plus" />
        <span>Add Zone</span>
      </button>
    </div>
  {:else}
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>CloudFlare ID</th>
            <th>Records</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if filteredZones.length === 0 && zoneSearchQuery}
            <tr>
              <td colspan="4" class="no-results">No zones found matching "{zoneSearchQuery}"</td>
            </tr>
          {:else}
            {#each filteredZones as zone}
              <tr>
                <td>{zone.name}</td>
                <td class="id-cell">{zone.id}</td>
                <td class="records-count">{records.filter(record => record.zoneId === zone.id).length}</td>
                <td class="actions-cell">
                  <button 
                    class="action-button delete-button" 
                    on:click={() => handleDeleteZone(zone)}
                    disabled={deletingZoneId === zone.id || records.some(record => record.zoneId === zone.id)}
                    title={records.some(record => record.zoneId === zone.id) ? 'Cannot delete a zone with associated records. Delete the records first.' : 'Delete zone'}
                  >
                    {#if deletingZoneId === zone.id}
                      <Loader size="small" />
                    {:else}
                      <Icon name="trash" />
                    {/if}
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .zones-section {
    margin-bottom: 2rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .section-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    min-width: 80px;
  }
  
  .actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
  }
  
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-right: auto;
  }
  
  .search-container input {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    color: var(--text-color);
    width: 200px;
    transition: all 0.2s;
  }
  
  .search-container input:focus {
    width: 240px;
    outline: none;
    border-color: var(--principal-orange);
  }
  
  .clear-search {
    position: absolute;
    right: 0.5rem;
    background: none;
    border: none;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0.25rem;
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
  
  .add-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--principal-orange);
    color: var(--text-color);
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .add-button:hover {
    background-color: var(--principal-orange-dark);
  }
  
  .error-message {
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.25rem;
    background-color: rgba(var(--error-color-rgb), 0.1);
    color: var(--error-color);
    border: 1px solid var(--error-color);
  }
  
  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0;
    color: var(--text-color-secondary);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: var(--card-bg);
    border-radius: 0.5rem;
    border: 1px dashed var(--border-color);
    color: var(--text-color-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .empty-state p {
    margin: 0;
  }
  
  .table-container {
    width: 100%;
    overflow-x: auto;
    background-color: var(--card-bg);
    border-radius: 0.5rem;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-table th, 
  .data-table td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .data-table th {
    font-weight: 500;
    color: var(--text-color);
    background-color: var(--card-header-bg);
  }
  
  .data-table tr:last-child td {
    border-bottom: none;
  }
  
  .id-cell {
    font-family: monospace;
    color: var(--text-color-secondary);
    font-size: 0.875rem;
  }
  
  .records-count {
    text-align: center;
    font-weight: 500;
  }
  
  .actions-cell {
    text-align: right;
    width: 1%;
    white-space: nowrap;
  }
  
  .action-button {
    padding: 0.4rem;
    border-radius: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--text-color-secondary);
    transition: all 0.2s;
  }
  
  .action-button:hover:not(:disabled) {
    background-color: var(--card-hover);
    color: var(--text-color);
  }
  
  .delete-button:hover:not(:disabled) {
    color: var(--error-color);
  }
  
  .delete-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .no-results {
    padding: 1.5rem;
    text-align: center;
    color: var(--text-color-secondary);
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .actions {
      width: 100%;
    }
    
    .search-container {
      flex: 1;
      margin-right: 0;
    }
    
    .search-container input {
      width: 100%;
    }
    
    .search-container input:focus {
      width: 100%;
    }
    
    .add-button {
      white-space: nowrap;
    }
  }
  
  @media (max-width: 480px) {
    .data-table th:nth-child(2),
    .data-table td:nth-child(2) {
      display: none;
    }
  }
</style> 