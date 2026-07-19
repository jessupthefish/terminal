import { writable } from 'svelte/store';

export const crt = writable<boolean>(
  JSON.parse(localStorage.getItem('crt') || 'true'),
);

crt.subscribe((value) => {
  localStorage.setItem('crt', JSON.stringify(value));
});
