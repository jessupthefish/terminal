import { writable } from 'svelte/store';
import { machines } from '../utils/machines';

const stored = localStorage.getItem('machine') || 'linux';

// 'modern' was renamed to 'linux'; unknown keys fall back too
export const machine = writable<string>(stored in machines ? stored : 'linux');

machine.subscribe((value) => {
  localStorage.setItem('machine', value);
});
