<script lang="ts">
  import { cwd } from '../stores/cwd';
  import { machine } from '../stores/machine';
  import { theme } from '../stores/theme';
  import { displayPath } from '../utils/filesystem';
  import { dosPath, machines } from '../utils/machines';

  export let path: string | undefined = undefined;

  let hostname = window.location.hostname;

  $: shownPath = path ?? displayPath($cwd);
  $: promptOverride = machines[$machine]?.prompt;
</script>

{#if promptOverride === undefined}
  <h1 class="font-bold flex">
    <span style={`color: ${$theme.yellow};`}>guest</span>
    <span style={`color: ${$theme.white}`}>@</span>
    <span style={`color: ${$theme.green}`}>{hostname}</span>
    <span style={`color: ${$theme.white}`}>:{shownPath}$</span>
  </h1>
{:else if promptOverride === 'dos-path'}
  <h1 class="flex">
    <span style={`color: ${$theme.foreground}`}>{dosPath(shownPath)}&gt;</span>
  </h1>
{:else if promptOverride !== ''}
  <h1 class="flex">
    <span style={`color: ${$theme.foreground}`}>{promptOverride}</span>
  </h1>
{/if}
