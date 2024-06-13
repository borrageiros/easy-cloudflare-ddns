<script>
  import Nav from "../components/Nav.svelte";
  import ElementsContainer from "../components/ElementsContainer.svelte";
  import { onMount } from "svelte";
  import { getAppSatus } from "../api";
  import storage from "../storage";

  let auth;
  let appStatus;
  let intervalId;

  onMount(async () => {
    auth = await storage.getItem("Authorization");
    if (!auth) {
      window.location.assign("/login");
    }
    updateAppStatus();
  });

  export async function updateAppStatus() {
    appStatus = await getAppSatus( window );
    appStatus = appStatus.data;

    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      updateRemainingTime();
    }, 1000);
  }
  
  function updateRemainingTime() {
    appStatus.remainingTime -= 1000;
    if ( appStatus.remainingTime <= 0 ) {
      updateAppStatus();
    }
  }
</script>

{#if auth}
<div>
  <Nav updateAppStatus={updateAppStatus} />
  <ElementsContainer appStatus={appStatus} updateAppStatus={updateAppStatus} />
</div>
{/if}
