<script>
  import { onMount } from 'svelte';
  
  let version = 'v1.0.0';
  
  onMount(async () => {
    try {
      const response = await fetch('/package.json');
      const pkg = await response.json();
      version = `v${pkg.version}`;
    } catch (error) {
      console.error('Failed to load version:', error);
    }
  });
</script>

<div class="absolute bottom-4 left-4 text-gray-600 text-sm z-10">
  <span>{version}</span>
</div>
