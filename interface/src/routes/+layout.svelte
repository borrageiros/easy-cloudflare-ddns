<script>
  import { onMount } from 'svelte';
  import { darkMode } from '../theme';
  import '../app.css';

  onMount(() => {
    if ($darkMode) {
      document.documentElement.classList.add('dark');
    }
  });

  $: if (typeof document !== 'undefined') {
    if ($darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<slot />