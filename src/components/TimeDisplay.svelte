<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { backOut } from 'svelte/easing';

  let time = new Date();
  let interval;

  // Reactive variables for Hours and Minutes
  $: hours = String(time.getHours()).padStart(2, '0');
  $: minutes = String(time.getMinutes()).padStart(2, '0');
  
  function updateTime() {
    time = new Date();
  }

  onMount(() => {
    updateTime();
    interval = setInterval(updateTime, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="w-full h-full flex items-center justify-center bg-black font-sans select-none overflow-hidden">
  
  <div class="flex items-baseline gap-1 sm:gap-2">
    
    {#key hours}
      <div 
        in:fly="{{ y: -40, duration: 500, easing: backOut }}" 
        class="plastic-font text-lego-red"
      >
        {hours}
      </div>
    {/key}

    <div class="plastic-font text-neutral-400 text-6xl sm:text-7xl animate-pulse pb-2">
      :
    </div>

    {#key minutes}
      <div 
        in:fly="{{ y: -40, duration: 500, easing: backOut, delay: 100 }}" 
        class="plastic-font text-lego-yellow"
      >
        {minutes}
      </div>
    {/key}

  </div>
</div>

<style>
  /* The "Plastic" Effect 
    We use standard sans-serif but force it to be "Black" weight (heaviest possible).
    The text-shadow creates the 3D 'block' side.
  */
  .plastic-font {
    font-weight: 900;     /* Maximum fatness */
    line-height: 1;       /* Tighter vertical spacing */
    letter-spacing: -0.02em; /* Tighten slightly for small screens */
    
    /* Responsive sizing for iPhone 6 (approx 375px width) */
    font-size: 5.5rem;   
  }

  /* Screen sizes larger than mobile get bigger text */
  @media (min-width: 640px) {
    .plastic-font {
      font-size: 9rem;
    }
  }

  /* Color Styles 
    1. The main color.
    2. A hard text-shadow that is a darker shade of the main color.
       This creates the "thickness" of the brick without taking up extra DOM space.
  */
  
  .text-lego-red {
    color: #ef4444; /* Bright Red */
    text-shadow: 
      0px 4px 0px #991b1b,   /* The 3D side (Dark Red) */
      0px 8px 6px rgba(0,0,0,0.5); /* The drop shadow on the floor */
  }

  .text-lego-yellow {
    color: #fbbf24; /* Amber/Yellow */
    text-shadow: 
      0px 4px 0px #b45309,   /* The 3D side (Dark Orange/Brown) */
      0px 8px 6px rgba(0,0,0,0.5);
  }

</style>