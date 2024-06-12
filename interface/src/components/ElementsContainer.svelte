<script>
  import {
    AccordionItem,
    Accordion,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Alert,
    Label,
    Tooltip,
    Card,
  } from "@sveltestrap/sveltestrap";
  import ZoneCard from "./ZoneCard.svelte";
  import { onMount } from "svelte";
  import { getZones, insertZone, getRecords, insertRecord, forceInterval } from "../api";
  import RecordCard from "./RecordCard.svelte";

  export let appStatus;
  export let updateAppStatus;

  onMount(async () => {
    await updateZones();
    await updateRecords();
    recordSelectedZone = zones && zones[0] ? zones[0].zoneId : null;
  });

  async function handleForceCheck() {
    const span = document.getElementById('remainingTime-span');
    const opacityTime = 30;
    if (span) {
      span.style.opacity = '0.5';
      setTimeout(() => {
        span.style.opacity = '1';
      }, opacityTime);
      setTimeout(() => {
        span.style.opacity = '0.5';
        setTimeout(() => {
          span.style.opacity = '1';
        }, opacityTime * 3);
      }, opacityTime * 2);
    }
    await forceInterval( window );
    updateAppStatus();
  }
  
  function msToTime(s) {
    function pad(n, z) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
  }

  // RECORDS
  let records;
  let recordName = "";
  let recordProxy = true;
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
  let ttlSelectedValue = ttlOptions[0].value;
  let recordSelectedZone = null;
  let createRecordValidationError = "";
  let createRecordModalOpen = false;

  async function updateRecords(){
    records = await getRecords( window );
    records = records && records.data && records.data;
  }

  async function updateTtl(){
    if ( recordProxy ) {
      ttlSelectedValue = ttlOptions[0].value;
    }
  }

  function openCreateRecordModal() {
    createRecordModalOpen = true;
  }

  function closeCreateRecordModal() {
    createRecordModalOpen = false;
  }

  async function createRecord() {
    if (!recordName || recordProxy === undefined) {
      createRecordValidationError = "All fields are required";
      return;
    } else {
      const response = await insertRecord( window, recordName, recordSelectedZone, recordProxy, ttlSelectedValue );
      
      if ( response.status === 409 ) {
        createRecordValidationError = "The record with the provided name already exists";
        return
      }

      if ( response.status === 404 ) {
        createRecordValidationError = "(A) Record not found in your CloudFlare account";
        return
      }

      if (response && response.data) {
        await updateRecords();
        recordName = "";
        recordSelectedZone = zones[0].zoneId;
        recordProxy = true;
        ttlSelectedValue = ttlOptions[0].value;
        createRecordValidationError = "";
      }
    }
    closeCreateRecordModal();
  }

  function handleKeyPressCreateRecordModal(event) {
    if (event.key === "Enter") {
      createRecord();
    }
  }
  // FIN RECORDS

  // ZONES
  let zones;
  let zoneName = "";
  let zoneId = "";
  let createZoneValidationError = "";
  let createZoneModalOpen = false;

  async function updateZones(){
    zones = await getZones( window );
    zones = zones && zones.data && zones.data;
    recordSelectedZone = zones && zones[0] ? zones[0].zoneId : null;
  }

  function openCreateZoneModal() {
    createZoneModalOpen = true;
  }

  function closeCreateZoneModal() {
    createZoneModalOpen = false;
  }

  async function createZone() {
    if (!zoneName || !zoneId) {
      createZoneValidationError = "All fields are required";
      return;
    } else {
      const response = await insertZone( window, zoneName, zoneId );

      if ( response.status === 409 ) {
        createZoneValidationError = "The zone with the provided 'name' or 'id' already exists";
        return
      }

      if ( response.status === 404 ) {
        createZoneValidationError = "Zone not found in your CloudFlare account";
        return
      }

      if (response && response.data) {
        await updateZones();
        zoneName = "";
        zoneId = "";
        createZoneValidationError = "";
      }
    }
    closeCreateZoneModal();
  }

  function handleKeyPressCreateZoneModal(event) {
    if (event.key === "Enter") {
      createZone();
    }
  }
  // FIN ZONES
</script>

<div style="display: flex; justify-content: center; margin-top: 70px;">
  <Accordion theme="dark" style="width: 65vw;">
    {#if appStatus}
    <Card body inverse outline={false} color="dark">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <span style="opacity: 0.3;">Actual IP: </span>
          <span>{appStatus && appStatus.externalIp}</span>
        </div>
        <div>
          <span style="opacity: 0.3;">Next check in: </span>
          <span id="remainingTime-span">{appStatus && msToTime(appStatus.remainingTime)}</span>
          &nbsp;&nbsp;
          <Button id="force-button-tooltip" size="sm" outline color="secondary" on:click={handleForceCheck}>
            <i class="bi bi-arrow-right-circle"></i>
          </Button>
          <Tooltip target="force-button-tooltip" placement="top">Force IP check</Tooltip>
        </div>
      </div>
    </Card>    
    {/if}
    <AccordionItem active={!zones || zones.length === 0}>
      <h4 class="m-0" slot="header">Zones</h4>
      <div class="accordion-content">
        {#if zones && zones.length > 0}
          {#each zones as zone, i}
            <ZoneCard zone={zone} updateZones={updateZones} updateRecords={updateRecords} />
          {/each}
        {/if}
        <Button outline color="primary" on:click={openCreateZoneModal} style="margin-top: 20px;">
          <i style="font-size: x-large;" class="bi bi-plus"></i>
        </Button>
      </div>
    </AccordionItem>
    {#if zones && zones.length > 0}
      <AccordionItem active={zones && zones.length > 0}>
        <h4 class="m-0" slot="header">Records</h4>
        <div class="accordion-content">
          {#if records && records.length > 0}
            {#each records as record, i}
              <RecordCard record={record} updateRecords={updateRecords} zones={zones} />
            {/each}
          {/if}
          <Button outline color="primary" on:click={openCreateRecordModal} style="margin-top: 20px;">
            <i style="font-size: x-large;" class="bi bi-plus"></i>
          </Button>
        </div>
      </AccordionItem>
    {/if}
  </Accordion>
</div>


<!-- MODAL CREATE ZONE -->
<Modal bind:isOpen={createZoneModalOpen} onClose={closeCreateZoneModal} centered={true}>
  <ModalHeader>Create new zone</ModalHeader>
  <ModalBody>
    {#if createZoneValidationError}
      <Alert color="danger">{createZoneValidationError}</Alert>
    {/if}

    <Label>Email</Label>
    <i id="zone-name-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="zone-name-tooltip" placement="top">This is only for identifying, you can really write whatever you want</Tooltip>
    <Input
      placeholder="Zone name (Example: borrageiros.com)"
      type="text"
      bind:value={zoneName}
      on:keypress={handleKeyPressCreateZoneModal}
    />

    <br />
    <Label>ZoneId</Label>
    <i id="zoneId-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="zoneId-tooltip" placement="top">The zone id, you can find it in the CloudFlare interface</Tooltip>
    <a href="https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/" target="_blank">How to get zone ID</a>
    <Input
      placeholder="Zone ID"
      type="text"
      bind:value={zoneId}
      on:keypress={handleKeyPressCreateZoneModal}
    />
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={closeCreateZoneModal}>Cancel</Button>
    <Button color="primary" on:click={createZone}>Add zone</Button>
  </ModalFooter>
</Modal>


<!-- MODAL CREATE RECORD -->
<Modal bind:isOpen={createRecordModalOpen} onClose={closeCreateRecordModal} centered={true}>
  <ModalHeader>Create new record</ModalHeader>
  <ModalBody>
    {#if createRecordValidationError}
      <Alert color="danger">{createRecordValidationError}</Alert>
    {/if}

    <Label>Name</Label>
    <i id="record-name-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="record-name-tooltip" placement="top">This is exactly the full subdomain name (FQDN)</Tooltip>
    <Input
      placeholder="Record name (Example: ddns.borrageiros.com)"
      type="text"
      bind:value={recordName}
      on:keypress={handleKeyPressCreateRecordModal}
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
    <Button color="secondary" on:click={closeCreateRecordModal}>Cancel</Button>
    <Button color="primary" on:click={createRecord}>Add record</Button>
  </ModalFooter>
</Modal>

<style>
  .accordion-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>