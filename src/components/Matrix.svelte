<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { overlay } from '../stores/overlay';
  import { theme } from '../stores/theme';

  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF';
  const FONT_SIZE = 16;

  let canvas: HTMLCanvasElement;
  let timer: ReturnType<typeof setInterval>;
  let drops: number[] = [];
  // the Enter keydown that launched the command also bubbles to window;
  // ignore events until the next tick so it doesn't instantly exit
  let ready = false;

  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drops = Array(Math.ceil(canvas.width / FONT_SIZE)).fill(1);
  }

  function draw() {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.fillStyle = hexToRgba($theme.background, 0.08);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = $theme.green;
    ctx.font = `${FONT_SIZE}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];

      ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

      if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  function exit(event: Event) {
    if (!ready) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    overlay.set('none');
  }

  onMount(() => {
    setTimeout(() => {
      ready = true;
    }, 100);

    resize();

    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = $theme.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    timer = setInterval(draw, 50);
  });

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<svelte:window on:keydown={exit} on:resize={resize} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="fixed inset-0 z-[60]" on:click={exit}>
  <canvas bind:this={canvas}></canvas>

  <p
    class="absolute bottom-4 w-full text-center opacity-60"
    style={`color: ${$theme.foreground}`}
  >
    press any key to wake up
  </p>
</div>
