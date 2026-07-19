<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { overlay } from '../stores/overlay';
  import { theme } from '../stores/theme';

  const WIDTH = 40;
  const HEIGHT = 18;
  const TICK_MS = 110;

  interface Point {
    x: number;
    y: number;
  }

  let snake: Point[] = [];
  let direction: Point = { x: 1, y: 0 };
  let nextDirection: Point = direction;
  let food: Point = { x: 0, y: 0 };
  let score = 0;
  let dead = false;
  let timer: ReturnType<typeof setInterval>;

  function spawnFood(body: Point[]): Point {
    let point: Point;

    do {
      point = {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
      };
    } while (body.some((p) => p.x === point.x && p.y === point.y));

    return point;
  }

  function reset() {
    snake = [
      { x: 20, y: 9 },
      { x: 19, y: 9 },
      { x: 18, y: 9 },
    ];
    direction = { x: 1, y: 0 };
    nextDirection = direction;
    food = spawnFood(snake);
    score = 0;
    dead = false;
  }

  function tick() {
    if (dead) {
      return;
    }

    direction = nextDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    const hitWall = head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT;
    const hitSelf = snake.some((p) => p.x === head.x && p.y === head.y);

    if (hitWall || hitSelf) {
      dead = true;

      return;
    }

    if (head.x === food.x && head.y === food.y) {
      snake = [head, ...snake];
      score += 1;
      food = spawnFood(snake);
    } else {
      snake = [head, ...snake.slice(0, -1)];
    }
  }

  function steer(x: number, y: number) {
    // no reversing into yourself
    if (x === -direction.x && y === -direction.y) {
      return;
    }

    nextDirection = { x, y };
  }

  function handleKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();

    switch (event.key) {
      case 'q':
      case 'Escape':
        overlay.set('none');
        break;
      case 'r':
        if (dead) {
          reset();
        }
        break;
      case 'ArrowUp':
      case 'w':
        steer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
        steer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
        steer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
        steer(1, 0);
        break;
    }
  }

  function render(body: Point[], foodPoint: Point, isDead: boolean): string {
    const rows: string[] = [];

    rows.push('┌' + '─'.repeat(WIDTH) + '┐');

    for (let y = 0; y < HEIGHT; y++) {
      let row = '│';

      for (let x = 0; x < WIDTH; x++) {
        if (body[0].x === x && body[0].y === y) {
          row += isDead ? 'X' : '█';
        } else if (body.some((p) => p.x === x && p.y === y)) {
          row += '▓';
        } else if (foodPoint.x === x && foodPoint.y === y) {
          row += '●';
        } else {
          row += ' ';
        }
      }

      rows.push(row + '│');
    }

    rows.push('└' + '─'.repeat(WIDTH) + '┘');

    return rows.join('\n');
  }

  $: grid = snake.length ? render(snake, food, dead) : '';

  onMount(() => {
    reset();
    timer = setInterval(tick, TICK_MS);
  });

  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

<div
  class="fixed inset-0 z-[60] flex flex-col items-center justify-center"
  style={`background-color: ${$theme.background}`}
>
  <p class="mb-2 font-bold" style={`color: ${$theme.yellow}`}>
    SNAKE — score: {score}
  </p>

  <pre
    class="leading-none text-sm sm:text-base"
    style={`color: ${$theme.green}`}>{grid}</pre>

  <p class="mt-2" style={`color: ${$theme.foreground}`}>
    {#if dead}
      game over — [r] restart · [q] quit
    {:else}
      arrows/wasd to steer · [q] quit
    {/if}
  </p>
</div>
