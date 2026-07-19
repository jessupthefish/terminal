import themes from '../../themes.json';
import type { Theme } from '../interfaces/theme';

export interface Machine {
  key: string;
  label: string;
  theme: Theme;
  boot: string;
  cursor: string;
  notFound: (cmd: string) => string;
  /** Ps1 override; undefined keeps guest@host, '' means no prompt at all */
  prompt?: string;
  /** printed after every command's output (C64's READY.) */
  ready?: string;
  /** era-native command aliases, shown by `machine ls` */
  aliases?: string;
}

// classic machines were monochrome: every ansi slot maps to the phosphor color
const mono = (
  name: string,
  background: string,
  foreground: string,
  bright: string,
): Theme => ({
  name,
  background,
  foreground,
  cursorColor: foreground,
  black: background,
  red: foreground,
  green: foreground,
  yellow: foreground,
  blue: foreground,
  purple: foreground,
  cyan: foreground,
  white: foreground,
  brightBlack: bright,
  brightRed: bright,
  brightGreen: bright,
  brightYellow: bright,
  brightBlue: bright,
  brightPurple: bright,
  brightCyan: bright,
  brightWhite: bright,
});

const notFoundDefault = (cmd: string) => `${cmd}: command not found`;
const syntaxError = () => '?SYNTAX  ERROR';

export const machines: Record<string, Machine> = {
  modern: {
    key: 'modern',
    label: 'this century (Gruvbox)',
    theme: themes.find((t) => t.name === 'GruvboxDark') as Theme,
    boot: 'Welcome back to the future.',
    cursor: '█',
    notFound: notFoundDefault,
  },
  c64: {
    key: 'c64',
    label: 'Commodore 64',
    theme: mono('C64', '#3E31A2', '#7C70DA', '#A5A0E8'),
    boot: `
    **** COMMODORE 64 BASIC V2 ****

 64K RAM SYSTEM  38911 BASIC BYTES FREE`,
    cursor: '█',
    notFound: syntaxError,
    prompt: '',
    ready: 'READY.',
    aliases: 'list',
  },
  apple2: {
    key: 'apple2',
    label: 'Apple II',
    theme: mono('AppleII', '#0b0b0b', '#33ff33', '#7dff7d'),
    boot: `APPLE ][

DISK II SLOT 6 DRIVE 1`,
    cursor: '█',
    notFound: syntaxError,
    prompt: ']',
    aliases: 'catalog',
  },
  msdos: {
    key: 'msdos',
    label: 'IBM PC / MS-DOS',
    theme: mono('MSDOS', '#000000', '#aaaaaa', '#ffffff'),
    boot: `Starting MS-DOS...

HIMEM is testing extended memory... done.`,
    cursor: '_',
    notFound: () => 'Bad command or file name',
    prompt: 'dos-path',
    aliases: 'dir, cls',
  },
  amber: {
    key: 'amber',
    label: 'amber phosphor terminal',
    theme: mono('Amber', '#100a00', '#ffb000', '#ffd766'),
    boot: `TERMINAL READY AT 9600 BAUD
NO CARRIER DETECTED. TYPE AWAY ANYWAY.`,
    cursor: '█',
    notFound: notFoundDefault,
  },
};

/** ~/projects -> C:\USERS\GUEST\PROJECTS */
export function dosPath(path: string): string {
  return (
    'C:\\USERS\\GUEST' + path.replace(/^~/, '').replace(/\//g, '\\')
  ).toUpperCase();
}
