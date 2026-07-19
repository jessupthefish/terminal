import { writable } from 'svelte/store';

export const crtStyles = [
  'phosphor',
  'sony',
  'tv',
  'mask',
  'checker',
  'rgb',
  'scanlines',
  'grid',
] as const;

export const crt = writable<boolean>(
  JSON.parse(localStorage.getItem('crt') || 'true'),
);

crt.subscribe((value) => {
  localStorage.setItem('crt', JSON.stringify(value));
});

const storedStyle = localStorage.getItem('crt-style') || 'phosphor';

export const crtStyle = writable<string>(
  (crtStyles as readonly string[]).includes(storedStyle) ? storedStyle : 'phosphor',
);

crtStyle.subscribe((value) => {
  localStorage.setItem('crt-style', value);
});
