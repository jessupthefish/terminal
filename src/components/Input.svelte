<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';
  import { cwd } from '../stores/cwd';
  import { history } from '../stores/history';
  import { overlay } from '../stores/overlay';
  import { theme } from '../stores/theme';
  import { commands } from '../utils/commands';
  import { completePath, displayPath } from '../utils/filesystem';
  import { escapeHtml } from '../utils/html';
  import { track } from '../utils/tracking';

  let command = '';
  let historyIndex = -1;

  let input: HTMLInputElement;

  const bootLines = [
    'Booting system... OK',
    'Loading modules... OK',
    'Establishing secure connection... OK',
    `Welcome to ${window.location.hostname || 'stevenjessup.com'}`,
  ];

  onMount(() => {
    input.focus();

    if ($history.length === 0) {
      const banner = (commands['banner'] as () => string)();
      const bootIndex = $history.length;

      $history = [...$history, { command: '', outputs: [] }];

      bootLines.forEach((line, i) => {
        setTimeout(() => {
          const entries = [...$history];

          entries[bootIndex] = {
            command: '',
            outputs: [...entries[bootIndex].outputs, line],
          };

          $history = entries;
        }, 250 * (i + 1));
      });

      setTimeout(() => {
        $history = [...$history, { command: 'banner', outputs: [banner] }];
      }, 250 * (bootLines.length + 1));
    }
  });

  afterUpdate(() => {
    input.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });

  const handleKeyDown = async (event: KeyboardEvent) => {
    if ($overlay !== 'none') {
      return;
    }

    if (event.key === 'Enter') {
      const [commandName, ...args] = command.split(' ');
      const path = displayPath($cwd);

      if (import.meta.env.VITE_TRACKING_ENABLED === 'true') {
        track(commandName, ...args);
      }

      const commandFunction = commands[commandName];

      if (commandFunction) {
        const output = await commandFunction(args);

        if (commandName !== 'clear') {
          $history = [...$history, { command, outputs: [output], path }];
        }
      } else {
        const output = `${escapeHtml(commandName)}: command not found`;

        $history = [...$history, { command, outputs: [output], path }];
      }

      command = '';
      historyIndex = -1;
    } else if (event.key === 'ArrowUp') {
      if (historyIndex < $history.length - 1) {
        historyIndex++;

        command = $history[$history.length - 1 - historyIndex].command;
      }

      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      if (historyIndex > -1) {
        historyIndex--;
        command =
          historyIndex >= 0
            ? $history[$history.length - 1 - historyIndex].command
            : '';
      }
      event.preventDefault();
    } else if (event.key === 'Tab') {
      event.preventDefault();

      if (command.includes(' ')) {
        const tokens = command.split(' ');
        const completed = completePath(tokens[tokens.length - 1], $cwd);

        if (completed !== null) {
          tokens[tokens.length - 1] = completed;
          command = tokens.join(' ');
        }
      } else {
        const autoCompleteCommand = Object.keys(commands).find((cmd) =>
          cmd.startsWith(command),
        );

        if (autoCompleteCommand) {
          command = autoCompleteCommand;
        }
      }
    } else if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();

      $history = [];
    } else if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();

      $history = [
        ...$history,
        { command: `${command}^C`, outputs: [], path: displayPath($cwd) },
      ];

      command = '';
      historyIndex = -1;
    }
  };
</script>

<svelte:window
  on:click={() => {
    input.focus();
  }}
/>

<div class="flex w-full">
  <p class="visible md:hidden">❯</p>

  <input
    id="command-input"
    name="command-input"
    aria-label="Command input"
    class="ml-2 bg-transparent outline-none"
    type="text"
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    style={`color: ${$theme.foreground}; caret-color: transparent; width: ${command.length}ch; min-width: 1px;`}
    bind:value={command}
    on:keydown={handleKeyDown}
    bind:this={input}
  />

  <span
    class="terminal-cursor select-none"
    aria-hidden="true"
    style={`color: ${$theme.foreground}`}>█</span>
</div>
