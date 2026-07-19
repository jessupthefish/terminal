import { writable } from 'svelte/store';
import { HOME } from '../utils/filesystem';

export const cwd = writable<string>(HOME);
