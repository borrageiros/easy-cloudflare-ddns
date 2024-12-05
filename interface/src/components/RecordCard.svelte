<script>
  import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Alert,
    Label,
    Tooltip,
  } from "@sveltestrap/sveltestrap";
  import { updateRecord, deleteRecord } from "../api";
  import { darkMode } from '../theme';

  const ttlOptions = [
    { label: 'Auto', value: 0 },
    { label: '1min', value: 60 },
    { label: '2min', value: 120 },
    { label: '5min', value: 300 },
    { label: '10min', value: 600 },
    { label: '15min', value: 900 },
    { label: '30min', value: 1800 },
    { label: '1hr', value: 3600 },
    { label: '2hr', value: 7200 },
    { label: '5hr', value: 18000 },
    { label: '12hr', value: 43200 },
    { label: '1day', value: 86400 }
  ];

  function getTtlByValue(value) {
    const option = ttlOptions.find(option => option.value === value);
    return option ? option.label : null;
  }

  export let updateRecords;
  export let record;
  export let zones;

  async function handleDeleteRecord(id) {
    await deleteRecord( window, id );
    await updateRecords();
  }

  // MODAL EDIT RECORD
  let recordName = record.name;
  let recordProxy = record.proxy;
  let ttlSelectedValue = record.ttl;
  let recordSelectedZone = record.zoneId;
  let updateRecordValidationError = "";
  let updateRecordModalOpen = false;

  async function updateTtl(){
    if ( recordProxy ) {
      ttlSelectedValue = ttlOptions[0].value;
    }
  }

  function openUpdateRecordModal() {
    recordName = record.name;
    recordProxy = record.proxy;
    ttlSelectedValue = record.ttl;
    recordSelectedZone = record.zoneId;
    updateRecordValidationError = "";
    updateRecordModalOpen = true;
  }

  function closeUpdateRecordModal() {
    updateRecordModalOpen = false;
  }

  async function handleUpdateRecord() {
    if (!recordName || recordProxy === undefined) {
      updateRecordValidationError = "All fields are required";
      return;
    } else {
      const response = await updateRecord( window, record._id, { name: recordName, zoneId: recordSelectedZone, proxy: recordProxy, ttl: ttlSelectedValue} );
      if (response && response.data) {
        await updateRecords();
        recordName = record.name;
        recordProxy = record.proxy;
        ttlSelectedValue = record.ttl;
        recordSelectedZone = record.zoneId;
        updateRecordValidationError = "";
      }
    }
    closeUpdateRecordModal();
  }

  function handleKeyPressUpdateRecordModal(event) {
    if (event.key === "Enter") {
      handleUpdateRecord();
    }
  }
</script>

<div class="card" class:dark={$darkMode}>
  <div class="card-body">
    <div class="grid-container">
      <div class="grid-item">{record.name}</div>

      <div class="grid-item">
        {#if record.proxy}
          <i style="color: #f68a1d;" class="bi bi-cloud-fill">&nbsp;Proxyed</i>
        {:else}
          <i style="color: #92979b;" class="bi bi-cloud-fill">&nbsp;DNS only</i>
        {/if}
      </div>

      <div class="grid-item">TTL: {getTtlByValue(record.ttl)}</div>

      <div class="grid-item">
        <Button outline color="primary" on:click={openUpdateRecordModal}>
          <i class="bi bi-pencil-fill"></i>
        </Button>
      </div>

      <div class="grid-item">
        <Button outline color="danger" on:click={() => handleDeleteRecord(record._id)}>
          <i class="bi bi-trash-fill"></i>
        </Button>
      </div>
    </div>
  </div>
</div>

<!-- MODAL EDDIT RECORD -->
<Modal bind:isOpen={updateRecordModalOpen} onClose={closeUpdateRecordModal} centered={true} dark={$darkMode}>
  <ModalHeader>Edit {record.name}</ModalHeader>
  <ModalBody>
    {#if updateRecordValidationError}
      <Alert color="danger">{updateRecordValidationError}</Alert>
    {/if}

    <Label>Name</Label>
    <i id="record-name-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="record-name-tooltip" placement="top">This is exactly the full subdomain name (FQDN)</Tooltip>
    <Input
      placeholder="Record name (Example: ddns.borrageiros.com)"
      type="text"
      bind:value={recordName}
      on:keypress={handleKeyPressUpdateRecordModal}
    />

    <br />
    <Label>Zone</Label>
    <i id="record-zone-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="record-zone-tooltip" placement="top">The domain to which the document belongs</Tooltip>
    <Input type="select" bind:value={recordSelectedZone} disabled={zones && zones.length === 1}>
      {#each zones as option}
        <option value={option.zoneId}>{option.name}</option>
      {/each}
    </Input>

    <br />
    <i style="color: #f68a1d;" class="bi bi-cloud-fill"></i>
    <Label>CloudFlare proxy</Label>
    <i id="recordId-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="recordId-tooltip" placement="top">Do you want cloudflare to mask your IP?</Tooltip>
    <Input
      bsSize="lg"
      type="switch"
      bind:value={recordProxy}
      bind:checked={recordProxy}
      on:change={updateTtl}
    />

    <br />
    <Label>TTL</Label>
    <i id="ttl-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="ttl-tooltip" placement="top">Time to live (TTL) refers to the amount of time or “hops” that a packet is set to exist inside a network before being discarded by a router.</Tooltip>
    <Input type="select" bind:value={ttlSelectedValue} disabled={recordProxy}>
      {#each ttlOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </Input>
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={closeUpdateRecordModal}>Cancel</Button>
    <Button color="primary" on:click={handleUpdateRecord}>Update record</Button>
  </ModalFooter>
</Modal>

<style>
  .card {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 16px;
    margin: 8px 0;
    width: 100%;
    background-color: var(--card-background);
    color: var(--text-color);
  }

  .card-body {
    display: flex;
    flex-direction: column;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto auto;
    gap: 10px;
    align-items: center;
  }

  .grid-item {
    padding: 8px;
  }

  i {
    cursor: pointer;
  }

  :global(.modal-content) {
    background-color: var(--card-background);
    color: var(--text-color);
  }

  :global(.form-control) {
    background-color: var(--input-background);
    color: var(--text-color);
    border-color: var(--input-border);
  }
</style>
