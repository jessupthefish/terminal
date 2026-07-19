<script lang="ts">
  import Ps1 from './components/Ps1.svelte';
  import Input from './components/Input.svelte';
  import History from './components/History.svelte';
  import Snake from './components/Snake.svelte';
  import Matrix from './components/Matrix.svelte';
  import { theme } from './stores/theme';
  import { crt } from './stores/crt';
  import { machine } from './stores/machine';
  import { overlay } from './stores/overlay';
</script>

<svelte:head>
  {#if import.meta.env.VITE_TRACKING_ENABLED === 'true'}
    <script
      async
      defer
      data-website-id={import.meta.env.VITE_TRACKING_SITE_ID}
      src={import.meta.env.VITE_TRACKING_URL}
    ></script>
  {/if}
</svelte:head>

<main
  class="h-full border-2 rounded-md p-4 overflow-auto text-xs sm:text-sm md:text-base machine-{$machine}"
  class:crt={$crt}
  style={`background-color: ${$theme.background}; color: ${$theme.foreground}; border-color: ${$theme.yellow};`}
>
  <History />

  <div class="flex flex-col md:flex-row">
    <Ps1 />

    <Input />
  </div>
</main>

{#if $overlay === 'snake'}
  <Snake />
{:else if $overlay === 'matrix'}
  <Matrix />
{/if}

{#if $crt}
  <div class="crt-overlay" aria-hidden="true"></div>
{/if}
