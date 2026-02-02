<script>
  import { onMount, onDestroy } from 'svelte';
  
  let time = '00:00';
  let interval;
  
  function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    time = `${hours}:${minutes}`;
  }
  
  onMount(() => {
    updateTime();
    interval = setInterval(updateTime, 1000);
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="w-4/5 flex items-center justify-center">
  <h1 class="text-9xl sm:text-[12rem] lg:text-[16rem] xl:text-[20rem] font-light">
    {time}
  </h1>
</div>
