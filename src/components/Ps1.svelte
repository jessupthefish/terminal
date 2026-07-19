<script lang="ts">
  import { cwd } from '../stores/cwd';
  import { theme } from '../stores/theme';
  import { displayPath } from '../utils/filesystem';

  export let path: string | undefined = undefined;

  let hostname = window.location.hostname;

  $: shownPath = path ?? displayPath($cwd);
</script>

<h1 class="font-bold flex">
  <span style={`color: ${$theme.yellow};`}>guest</span>
  <span style={`color: ${$theme.white}`}>@</span>
  <span style={`color: ${$theme.green}`}>{hostname}</span>
  <span style={`color: ${$theme.white}`}>:{shownPath}$</span>
</h1>
