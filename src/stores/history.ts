import { writable } from 'svelte/store';
import type { Command } from '../interfaces/command';

// scrollback is session-only: every visit boots fresh like a real machine
localStorage.removeItem('history');

export const history = writable<Array<Command>>([]);
