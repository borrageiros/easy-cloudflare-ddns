<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import type { DnsRecord } from "$lib/api";
  import { createEventDispatcher } from "svelte";
  import Loader from "$lib/components/Loader.svelte";
  
  export let records: DnsRecord[] = [];
  export let filteredRecords: DnsRecord[] = [];
  export let loading: boolean = false;
  export let error: string = '';
  export let recordSearchQuery: string = '';
  
  const dispatch = createEventDispatcher();
  
  function openRecordsModal(edit = false, record: DnsRecord | null = null) {
    dispatch('openRecordsModal', { edit, record });
  }
  
  function filterRecords() {
    dispatch('filterRecords');
  }
  
  $: if (recordSearchQuery !== undefined) {
    filterRecords();
  }
</script>

<div class="records-section">
  <div class="section-header">
    <h2>Records</h2>
    <div class="actions">
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Search records..." 
          bind:value={recordSearchQuery}
          disabled={loading || records.length === 0}
        />
        <button class="clear-search" on:click={() => recordSearchQuery = ''} disabled={!recordSearchQuery}>
          <Icon name="x" />
        </button>
      </div>
      <button class="add-button" on:click={() => openRecordsModal()}>
        <Icon name="plus" />
        <span>Add Record</span>
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
      <span>Loading records...</span>
    </div>
  {:else if records.length === 0}
    <div class="empty-state">
      <p>No records found. Add a record to get started.</p>
      <button class="add-button" on:click={() => openRecordsModal()}>
        <Icon name="plus-circle" />
        <span>Add Record</span>
      </button>
    </div>
  {:else}
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>TTL</th>
            <th>Proxied</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if filteredRecords.length === 0 && recordSearchQuery}
            <tr>
              <td colspan="6" class="no-results">No records found matching "{recordSearchQuery}"</td>
            </tr>
          {:else}
            {#each filteredRecords as record}
              <tr>
                <td class="name-cell">{record.name}</td>
                <td>
                  {#if record.proxied || record.ttl === 1}
                    Auto
                  {:else if record.ttl < 60}
                    {record.ttl}s
                  {:else if record.ttl < 3600}
                    {Math.floor(record.ttl / 60)}m
                  {:else if record.ttl < 86400}
                    {Math.floor(record.ttl / 3600)}h
                  {:else}
                    {Math.floor(record.ttl / 86400)}d
                  {/if}
                </td>
                <td>
                  {#if record.proxied}
                    <span class="proxied-badge"><Icon name="cloud" /></span>
                  {:else}
                    <span class="not-proxied-badge"><Icon name="x" /></span>
                  {/if}
                </td>
                <td class="date-cell">
                  {#if record.updatedAt}
                    {new Date(record.updatedAt).toLocaleString()}
                  {:else}
                    -
                  {/if}
                </td>
                <td class="actions-cell">
                  <button 
                    class="action-button edit-button" 
                    on:click={() => openRecordsModal(true, record)}
                    title="Edit record"
                  >
                    <Icon name="edit" />
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
  .records-section {
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
    width: 100%;
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
  
  .name-cell {
    word-break: break-all;
    max-width: 300px;
  }
  
  .date-cell {
    white-space: nowrap;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
  }
  
  .actions-cell {
    text-align: right;
    width: 1%;
    white-space: nowrap;
  }
  
  .proxied-badge,
  .not-proxied-badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .proxied-badge {
    background-color: rgba(var(--success-color-rgb), 0.1);
    color: var(--principal-orange);
    border: 2px solid var(--principal-orange);
  }
  
  .not-proxied-badge {
    background-color: rgba(var(--text-color-rgb), 0.05);
    color: var(--error-color);
    border: 2px solid var(--error-color);
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
  
  .action-button:hover {
    background-color: var(--card-hover);
    color: var(--text-color);
  }
  
  .edit-button:hover {
    color: var(--principal-orange);
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
  
  @media (max-width: 640px) {
    .data-table th:nth-child(3),
    .data-table td:nth-child(3),
    .data-table th:nth-child(4),
    .data-table td:nth-child(4) {
      display: none;
    }
    
    .actions-cell {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    
    .action-button {
      padding: 0.5rem;
    }
  }
  
  @media (max-width: 480px) {
    .data-table th:nth-child(2),
    .data-table td:nth-child(2) {
      display: none;
    }
    
    .name-cell {
      max-width: 180px;
    }
  }
</style> 