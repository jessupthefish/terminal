<script lang="ts">
  import { onMount, tick } from 'svelte';
  import Ps1 from './components/Ps1.svelte';
  import Input from './components/Input.svelte';
  import History from './components/History.svelte';
  import Snake from './components/Snake.svelte';
  import Matrix from './components/Matrix.svelte';
  import { theme } from './stores/theme';
  import { crt, crtStyle } from './stores/crt';

  let styleToast = '';
  let toastTimer: ReturnType<typeof setTimeout>;
  let firstStyleValue = true;

  crtStyle.subscribe((style) => {
    if (firstStyleValue) {
      firstStyleValue = false;

      return;
    }

    styleToast = style;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (styleToast = ''), 1500);
  });
  import { machine } from './stores/machine';
  import { overlay } from './stores/overlay';
  import { machines } from './utils/machines';

  let screenEl: HTMLElement | undefined;
  let scale = 1;

  $: screenDef = machines[$machine]?.screen;

  async function fit() {
    if (!screenDef || !screenEl) {
      scale = 1;

      return;
    }

    await tick();

    const bezel = screenEl.parentElement;

    if (!bezel) {
      return;
    }

    scale = Math.min(
      (bezel.clientWidth * 0.95) / screenEl.offsetWidth,
      (bezel.clientHeight * 0.95) / screenEl.offsetHeight,
    );
  }

  $: screenDef, screenEl, fit();

  onMount(() => {
    document.fonts.ready.then(fit);
    document.fonts.addEventListener('loadingdone', fit);

    return () => document.fonts.removeEventListener('loadingdone', fit);
  });
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

<svelte:window on:resize={fit} />

{#if screenDef}
  <div class="bezel">
    <main
      bind:this={screenEl}
      class="machine-screen machine-{$machine}"
      class:crt={$crt}
      style={`width: ${screenDef.cols}ch; height: ${screenDef.rows * screenDef.fontSize}px; font-size: ${screenDef.fontSize}px; border: ${screenDef.border ?? 0}px solid ${$theme.yellow}; transform: scale(${scale}); background-color: ${$theme.background}; color: ${$theme.foreground};`}
    >
      <div class="screen-content">
        <History />

        <div class="flex flex-col md:flex-row">
          <Ps1 />

          <Input />
        </div>
      </div>
    </main>
  </div>
{:else}
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
{/if}

{#if $overlay === 'snake'}
  <Snake />
{:else if $overlay === 'matrix'}
  <Matrix />
{/if}

{#if $crt}
  <div class="crt-overlay crt-style-{$crtStyle}" aria-hidden="true"></div>
{/if}

{#if styleToast}
  <div
    class="crt-toast"
    style={`background-color: ${$theme.background}; color: ${$theme.foreground}; border-color: ${$theme.yellow};`}
  >
    crt: {styleToast}
  </div>
{/if}
