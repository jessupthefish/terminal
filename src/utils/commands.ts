import { get } from 'svelte/store';
import packageJson from '../../package.json';
import themes from '../../themes.json';
import { crt } from '../stores/crt';
import { cwd } from '../stores/cwd';
import { history } from '../stores/history';
import { theme } from '../stores/theme';
import { getNode, listNames, resolvePath } from './filesystem';
import { fetchRepos, formatRepoTable } from './github';
import { overlay } from '../stores/overlay';

const hostname = window.location.hostname;

const hiddenCommands = ['snake', 'matrix', 'sudo'];

const fortunes = [
  'There are only two hard things in computer science: cache invalidation, naming things, and off-by-one errors.',
  'It works on my machine.',
  "A good commit message explains why. A great one exists at all.",
  'Weeks of coding can save you hours of planning.',
  'The best code is no code at all. The second best is deleted code.',
  "rm -rf / — don't. Just don't.",
  'Real programmers count from 0.',
  'The terminal is undefeated.',
];

export const commands: Record<string, (args: string[]) => Promise<string> | string> = {
  help: () =>
    'Available commands: ' +
    Object.keys(commands)
      .filter((c) => !hiddenCommands.includes(c))
      .join(', '),
  hostname: () => hostname,
  whoami: () => "guest (if you were root, you'd know it)",
  about: () =>
    "Hi, I'm Steven Jessup — a developer and veteran who's passionate about clean code and creative tech. This site is my interactive resume. Type 'help' to explore.",
  resume: () =>
    'View my resume here: <a href="https://jessupthefish.github.io/resume" target="_blank">resume.pdf</a>',
  projects: async () => {
    const repos = await fetchRepos();

    if (!repos || repos.length === 0) {
      return 'Could not reach GitHub right now. View my projects at: <a href="https://github.com/jessupthefish?tab=repositories" target="_blank">github.com/jessupthefish</a>';
    }

    return formatRepoTable(repos);
  },
  ls: (args: string[]) => {
    const all = args.some((a) => a.startsWith('-') && a.includes('a'));
    const target = args.find((a) => !a.startsWith('-')) ?? '.';
    const node = getNode(resolvePath(target, get(cwd)));

    if (!node) {
      return `ls: ${target}: No such file or directory`;
    }

    if (node.type === 'file') {
      return target;
    }

    return listNames(node, all).join('  ');
  },
  cd: (args: string[]) => {
    const target = args[0] ?? '~';
    const path = resolvePath(target, get(cwd));
    const node = getNode(path);

    if (!node) {
      return `cd: ${target}: No such file or directory`;
    }

    if (node.type !== 'dir') {
      return `cd: ${target}: Not a directory`;
    }

    cwd.set(path);

    return '';
  },
  pwd: () => get(cwd),
  cat: (args: string[]) => {
    if (args.length === 0) {
      return 'Usage: cat [file]';
    }

    return args
      .map((arg) => {
        const node = getNode(resolvePath(arg, get(cwd)));

        if (!node) {
          return `cat: ${arg}: No such file or directory`;
        }

        if (node.type === 'dir') {
          return `cat: ${arg}: Is a directory`;
        }

        return node.content();
      })
      .join('\n');
  },
  date: () => new Date().toLocaleString(),
  vi: () => `why use vi? try 'emacs'`,
  vim: () => `why use vim? try 'emacs'`,
  emacs: () => `why use emacs? try 'vim'`,
  echo: (args: string[]) => args.join(' '),
  sudo: (args: string[]) => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    return `Permission denied: unable to run the command '${args[0]}' as root.`;
  },
  theme: (args: string[]) => {
    const usage = `Usage: theme [args].
    [args]:
      ls: list all available themes
      set: set theme to [theme]

    [Examples]:
      theme ls
      theme set gruvboxdark
    `;
    if (args.length === 0) {
      return usage;
    }

    switch (args[0]) {
      case 'ls': {
        let result = themes.map((t) => t.name.toLowerCase()).join(', ');
        result += `\nYou can preview all these themes here: ${packageJson.repository.url}/tree/main/docs/themes`;

        return result;
      }

      case 'set': {
        if (args.length !== 2) {
          return usage;
        }

        const selectedTheme = args[1];
        const t = themes.find((t) => t.name.toLowerCase() === selectedTheme);

        if (!t) {
          return `Theme '${selectedTheme}' not found. Try 'theme ls' to see all available themes.`;
        }

        theme.set(t);

        return `Theme set to ${selectedTheme}`;
      }

      default: {
        return usage;
      }
    }
  },
  repo: () => {
    window.open(packageJson.repository.url, '_blank');

    return 'Opening repository...';
  },
  crt: (args: string[]) => {
    switch (args[0]) {
      case 'on':
        crt.set(true);

        return 'CRT effects enabled.';
      case 'off':
        crt.set(false);

        return 'CRT effects disabled.';
      default:
        return 'Usage: crt [on|off]';
    }
  },
  clear: () => {
    history.set([]);

    return '';
  },
  email: () => {
    window.open(`mailto:${packageJson.author.email}`);

    return `Opening mailto:${packageJson.author.email}...`;
  },
  weather: async (args: string[]) => {
    const city = args.join('+');

    if (!city) {
      return 'Usage: weather [city]. Example: weather Manteca';
    }

    const weather = await fetch(`https://wttr.in/${city}?ATm`);

    return weather.text();
  },
  exit: () => {
    return 'Please close the tab to exit.';
  },
  snake: () => {
    overlay.set('snake');

    return 'Starting snake... arrows/wasd to steer, q to quit.';
  },
  matrix: () => {
    overlay.set('matrix');

    return 'Wake up, Neo...';
  },
  cowsay: (args: string[]) => {
    const text = args.join(' ') || 'moo';
    const border = '-'.repeat(text.length + 2);

    return ` ${'_'.repeat(text.length + 2)}
< ${text} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
  },
  fortune: () => fortunes[Math.floor(Math.random() * fortunes.length)],
  curl: async (args: string[]) => {
    if (args.length === 0) {
      return 'curl: no URL provided';
    }

    const url = args[0];

    try {
      const response = await fetch(url);
      const data = await response.text();

      return data;
    } catch (error) {
      return `curl: could not fetch URL ${url}. Details: ${error}`;
    }
  },
  banner: () => `
███████╗████████╗███████╗██╗   ██╗███████╗███╗   ██╗     ██╗███████╗███████╗███████╗██╗   ██╗██████╗  ██████╗ ███████╗██╗   ██╗
██╔════╝╚══██╔══╝██╔════╝██║   ██║██╔════╝████╗  ██║     ██║██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗ ██╔══██╗██╔════╝██║   ██║
███████╗   ██║   █████╗  ██║   ██║█████╗  ██╔██╗ ██║     ██║█████╗  ███████╗███████╗██║   ██║██████╔╝ ██║  ██║█████╗  ██║   ██║
╚════██║   ██║   ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║██   ██║██╔══╝  ╚════██║╚════██║██║   ██║██╔═══╝  ██║  ██║██╔══╝  ╚██╗ ██╔╝
███████║   ██║   ███████╗ ╚████╔╝ ███████╗██║ ╚████║╚█████╔╝███████╗███████║███████║╚██████╔╝██║   ██╗██████╔╝███████╗ ╚████╔╝
╚══════╝   ╚═╝   ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝ ╚════╝ ╚══════╝╚══════╝╚══════╝ ╚═════╝ ╚═╝   ╚═╝╚═════╝ ╚══════╝  ╚═══╝ v${packageJson.version}

Type 'help' to see list of available commands.
`,
};
