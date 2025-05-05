<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  
  export let title = '';
  export let open = false;
  export let closable = true;
  
  const dispatch = createEventDispatcher();
  
  function closeModal() {
    if (closable) {
      dispatch('close');
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open && closable) {
      closeModal();
    }
  }
  
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if open}
  <div class="modal-backdrop" on:click={closeModal} on:keydown={() => {}} role="presentation">
    <div class="modal-container" on:click|stopPropagation on:keydown={() => {}} role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <h2>{title}</h2>
        {#if closable}
          <button class="close-button" on:click={closeModal}>
            <Icon name="x" />
          </button>
        {:else}
          <div class="modal-required">
            <Icon name="alert-triangle" />
            <span>Required</span>
          </div>
        {/if}
      </div>
      <div class="modal-content">
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }
  
  .modal-container {
    background-color: var(--card-bg);
    border-radius: 8px;
    box-shadow: var(--shadow);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border-color);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
  }
  
  .close-button {
    background: none;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  
  .close-button:hover {
    background-color: var(--card-hover);
    color: var(--error-color);
  }
  
  .modal-content {
    padding: 16px;
    overflow-y: auto;
  }
  
  .modal-required {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--error-color);
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .modal-container {
      width: 95%;
      max-height: 80vh;
    }
  }
  
  @media (max-width: 480px) {
    .modal-backdrop {
      align-items: flex-end;
    }
    
    .modal-container {
      width: 100%;
      max-width: 100%;
      border-radius: 8px 8px 0 0;
      max-height: 90vh;
    }
    
    .modal-header {
      padding: 12px;
    }
    
    .modal-content {
      padding: 12px;
    }
    
    .modal-header h2 {
      font-size: 1.1rem;
    }
  }
</style> 