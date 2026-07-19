import { writable } from 'svelte/store';

export const machine = writable<string>(
  localStorage.getItem('machine') || 'modern',
);

machine.subscribe((value) => {
  localStorage.setItem('machine', value);
});
