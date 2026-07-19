import { writable } from 'svelte/store';

export type Overlay = 'none' | 'snake' | 'matrix';

export const overlay = writable<Overlay>('none');
