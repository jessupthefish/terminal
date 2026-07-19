import themes from '../../themes.json';
import type { Theme } from '../interfaces/theme';

export interface Machine {
  key: string;
  label: string;
  theme: Theme;
  boot: string;
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

export const machines: Record<string, Machine> = {
  modern: {
    key: 'modern',
    label: 'this century (Gruvbox)',
    theme: themes.find((t) => t.name === 'GruvboxDark') as Theme,
    boot: 'Welcome back to the future.',
  },
  c64: {
    key: 'c64',
    label: 'Commodore 64',
    theme: mono('C64', '#40318D', '#7C70DA', '#A5A0E8'),
    boot: `
    **** COMMODORE 64 BASIC V2 ****

 64K RAM SYSTEM  38911 BASIC BYTES FREE

READY.`,
  },
  apple2: {
    key: 'apple2',
    label: 'Apple II',
    theme: mono('AppleII', '#0b0b0b', '#33ff33', '#7dff7d'),
    boot: `APPLE ][

DISK II SLOT 6 DRIVE 1

]`,
  },
  msdos: {
    key: 'msdos',
    label: 'IBM PC / MS-DOS',
    theme: mono('MSDOS', '#000000', '#aaaaaa', '#ffffff'),
    boot: `Starting MS-DOS...

HIMEM is testing extended memory... done.

C:\\&gt;`,
  },
  amber: {
    key: 'amber',
    label: 'amber phosphor terminal',
    theme: mono('Amber', '#100a00', '#ffb000', '#ffd766'),
    boot: `TERMINAL READY AT 9600 BAUD
NO CARRIER DETECTED. TYPE AWAY ANYWAY.`,
  },
};
