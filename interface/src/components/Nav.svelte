<script>
  import {
    Navbar,
    NavbarBrand,
    Nav,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Alert,
    Label,
    Tooltip
  } from "@sveltestrap/sveltestrap";
  import storage from "../storage";
  import { onMount } from "svelte";
  import { getConfig, insertConfig, updateConfig } from "../api";

  export let updateAppStatus;

  let auth;
  let config;
  let editConfigModalOpen = false;
  let createConfigModalOpen = false;

  let email = "";
  let authToken = "";
  let checkInterval = 5;
  let validationError = "";

  onMount(async () => {
    config = await getConfig( window );
    config = config && config.data;
    if (config) {
      email = config.email;
      authToken = config.token;
      checkInterval = config.checkInterval;
    } else {
      openCreateConfigModal();
    }
  });

  async function logOut() {
    storage.remove("Authorization");
    window.location.assign("/login");
  }

  function openEditConfigModal() {
    editConfigModalOpen = true;
  }

  function closeEditConfigModal() {
    if (config) {
      email = config.email;
      authToken = config.token;
      checkInterval = config.checkInterval;
    }
    validationError = "";
    editConfigModalOpen = false;
  }

  async function editConfig() {
    if (!email || !authToken || !checkInterval) {
      validationError = "All fields are required";
      return;
    } else if (checkInterval < 0) {
      validationError = "The interval has to be a positive value";
      return;
    } else if (checkInterval > 1440) {
      validationError = "The interval must be less or equal than 1440 minutes (24 hours)";
      return;
    } else {
      const response = await updateConfig( window, { email, token: authToken, checkInterval } );
            
      if ( response.status === 401 ) {
        validationError = "Incorrect CloudFlare credentials";
        return;
      }
      config = response && response.data && response.data;
    }
    validationError = "";
    updateAppStatus();
    closeEditConfigModal();
  }

  function handleKeyPressEditConfigModal(event) {
    if (event.key === "Enter") {
      editConfig();
    }
  }

  function openCreateConfigModal() {
    createConfigModalOpen = true;
  }

  function closeCreateConfigModal() {
    if (config) {
      email = config.email;
      authToken = config.token;
      checkInterval = config.checkInterval;
    }
    validationError = "";
    createConfigModalOpen = false;
  }

  async function createConfig() {
    if (!email || !authToken || !checkInterval) {
      validationError = "All fields are required";
      return;
    } else if (checkInterval < 0) {
      validationError = "The interval has to be a positive value";
      return;
    } else {
      const response = await insertConfig( window, email, authToken, checkInterval );
      
      if ( response.status === 401 ) {
        validationError = "Incorrect CloudFlare credentials";
        return;
      }
      config = response && response.data && response.data;
    }
    validationError = "";
    updateAppStatus();
    closeCreateConfigModal();
  }

  function handleKeyPressCreateConfigModal(event) {
    if (event.key === "Enter") {
      createConfig();
    }
  }
</script>

<Navbar dark expand="sm" container="sm" style="height: 100px;">
  <NavbarBrand href="/" style="font-size: 1.3rem;">
    Easy
    <i style="color: #f68a1d;" class="bi bi-cloud-fill">&nbsp;CloudFlare</i>
    DDNS
  </NavbarBrand>
  <Nav class="ms-auto" navbar>
    <Dropdown direction="down">
      <DropdownToggle nav caret style="font-size: 1.3rem; margin-left: 100px">
        <i class="bi bi-gear-fill" style="font-size: 1.3rem;" />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem on:click={openEditConfigModal} style="font-size: 1.3rem;">
          <i class="bi bi-gear-fill" />
          Configuration
        </DropdownItem>
        <DropdownItem class="text-danger" on:click={logOut} style="font-size: 1.3rem;">
          <i class="bi bi-box-arrow-left" />
          Log out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </Nav>
</Navbar>

<!-- MODAL CREATE CONFIG -->
<Modal bind:isOpen={createConfigModalOpen} onClose={closeCreateConfigModal} centered={true}>
  <ModalHeader>Initial configuration</ModalHeader>
  <ModalBody>
    {#if validationError}
      <Alert color="danger">{validationError}</Alert>
    {/if}

    <Label>Email</Label>
    <i id="email-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="email-tooltip" placement="top">The email used to login in CloudFlare</Tooltip>
    <Input
      placeholder="CloudFlare email"
      type="email"
      bind:value={email}
      on:keypress={handleKeyPressCreateConfigModal}
    />

    <br />
    <Label>Token</Label>
    <i id="token-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="token-tooltip" placement="top">CloudFlare API token<br/>(scoped to edit zones)</Tooltip>
    <a href="https://developers.cloudflare.com/fundamentals/api/get-started/create-token/" target="_blank">Get edit zone DNS token</a>
    <Input
      placeholder="CloudFlare auth token"
      type="text"
      bind:value={authToken}
      on:keypress={handleKeyPressCreateConfigModal}
    />

    <br />
    <Label>Check interval</Label>
    <i id="check-internal-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="check-internal-tooltip" placement="top">The interval in which the app will update the IPs of the records (in minutes)</Tooltip>
    <Input
      placeholder="Check every... (minutes)"
      type="number"
      bind:value={checkInterval}
      on:keypress={handleKeyPressCreateConfigModal}
    />
  </ModalBody>
  <ModalFooter>
    <Button color="primary" on:click={createConfig}>Save</Button>
  </ModalFooter>
</Modal>

<!-- MODAL EDIT CONFIG -->
<Modal bind:isOpen={editConfigModalOpen} onClose={closeEditConfigModal} centered={true}>
  <ModalHeader>Configuration</ModalHeader>
  <ModalBody>
    {#if validationError}
      <Alert color="danger">{validationError}</Alert>
    {/if}

    <Label>Email</Label>
    <i id="email-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="email-tooltip" placement="top">The email used to login in CloudFlare</Tooltip>
    <Input
      placeholder="CloudFlare email"
      type="email"
      bind:value={email}
      on:keypress={handleKeyPressEditConfigModal}
    />

    <br />
    <Label>Token</Label>
    <i id="token-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="token-tooltip" placement="top">CloudFlare API token<br/>(scoped to edit zone DNS)</Tooltip>
    <a href="https://developers.cloudflare.com/fundamentals/api/get-started/create-token/" target="_blank">Get edit zone DNS token</a>
    <Input
      placeholder="CloudFlare auth token"
      type="text"
      bind:value={authToken}
      on:keypress={handleKeyPressEditConfigModal}
    />

    <br />
    <Label>Check interval</Label>
    <i id="check-internal-tooltip" class="bi bi-info-circle-fill"></i>
    <Tooltip target="check-internal-tooltip" placement="top">The interval in which the app will update the IPs of the records (in minutes)<br/>( min 1 min / max 24 hours)</Tooltip>
    <Input
      placeholder="Check every... (minutes)"
      type="number"
      bind:value={checkInterval}
      max={1440}
      min={1}
      on:keypress={handleKeyPressEditConfigModal}
    />
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" on:click={closeEditConfigModal}>Close</Button>
    <Button color="primary" on:click={editConfig}>Save</Button>
  </ModalFooter>
</Modal>

<style>
</style>
