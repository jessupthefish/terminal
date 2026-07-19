import { writable } from 'svelte/store';

export const crtStyles = ['classic', 'fine', 'aperture', 'soft'] as const;

export const crt = writable<boolean>(
  JSON.parse(localStorage.getItem('crt') || 'true'),
);

crt.subscribe((value) => {
  localStorage.setItem('crt', JSON.stringify(value));
});

const storedStyle = localStorage.getItem('crt-style') || 'classic';

export const crtStyle = writable<string>(
  (crtStyles as readonly string[]).includes(storedStyle) ? storedStyle : 'classic',
);

crtStyle.subscribe((value) => {
  localStorage.setItem('crt-style', value);
});
