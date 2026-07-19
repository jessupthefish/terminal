<script lang="ts">
  import { history } from '../stores/history';
  import { theme } from '../stores/theme';
  import Ps1 from './Ps1.svelte';
</script>

{#each $history as { command, outputs, path }}
  <div style={`color: ${$theme.foreground}`}>
    {#if command !== ''}
      <div class="flex flex-col md:flex-row">
        <Ps1 path={path ?? '~'} />

        <div class="flex">
          <p class="visible md:hidden">❯</p>

          <p class="px-2">{command}</p>
        </div>
      </div>
    {/if}

    {#each outputs as output}
      <p class="whitespace-pre-wrap">
        {@html output}
      </p>
    {/each}
  </div>
{/each}
