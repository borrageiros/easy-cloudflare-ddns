<script>
  import { Button } from "@sveltestrap/sveltestrap";
  import { deleteZone } from "../api";

  export let updateZones;
  export let updateRecords;
  export let zone;

  async function handleDeleteZone(id) {
    await deleteZone( window, id );
    await updateZones();
    await updateRecords();
  }
</script>

<div class="card">
  <div class="card-body">
    <div class="info">
      <h5 class="card-title">{zone.name}</h5>
      <p class="card-text">Zone ID: {zone.zoneId}</p>
    </div>
    <div class="action">
      <Button outline color="danger" on:click={() => handleDeleteZone(zone.zoneId)}>
        <i class="bi bi-trash-fill"></i>
      </Button>
    </div>
  </div>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 16px;
    margin: 8px 0;
    width: 100%;
  }

  .card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-title, .card-text {
    margin: 0;
    padding: 0 8px;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .card-text {
    font-size: 1rem;
    color: #666;
  }

  .action {
    padding-left: 8px;
  }

  i {
    cursor: pointer;
  }
</style>
