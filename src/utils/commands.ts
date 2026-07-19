import { get } from 'svelte/store';
import packageJson from '../../package.json';
import themes from '../../themes.json';
import { crt } from '../stores/crt';
import { cwd } from '../stores/cwd';
import { history } from '../stores/history';
import { machine } from '../stores/machine';
import { theme } from '../stores/theme';
import { machines } from './machines';
import { getNode, listNames, resolvePath } from './filesystem';
import { fetchRepos, formatRepoTable } from './github';
import { escapeHtml } from './html';
import { overlay } from '../stores/overlay';

const hostname = window.location.hostname;
const loadedAt = Date.now();

const hiddenCommands = ['snake', 'matrix', 'sudo'];

interface HelpEntry {
  usage: string;
  description: string;
}

const helpSections: Array<{ title: string; entries: HelpEntry[] }> = [
  {
    title: 'steven',
    entries: [
      { usage: 'about', description: 'who I am' },
      { usage: 'resume', description: 'view my resume' },
      { usage: 'projects', description: 'my GitHub repos, fetched live' },
      { usage: 'email', description: 'get in touch' },
    ],
  },
  {
    title: 'files',
    entries: [
      { usage: 'ls [-a] [dir]', description: 'list directory contents' },
      { usage: 'cd [dir]', description: 'change directory' },
      { usage: 'cat <file>', description: 'print file contents' },
      { usage: 'pwd', description: 'print working directory' },
    ],
  },
  {
    title: 'terminal',
    entries: [
      { usage: 'theme ls|set <name>', description: 'change the color scheme' },
      { usage: 'machine ls|set <name>', description: 'emulate a classic computer' },
      { usage: 'crt on|off', description: 'toggle CRT effects' },
      { usage: 'neofetch', description: 'system information' },
      { usage: 'history', description: 'show command history' },
      { usage: 'clear', description: 'clear the screen (or Ctrl+L)' },
      { usage: 'banner', description: 'print the banner' },
    ],
  },
  {
    title: 'misc',
    entries: [
      { usage: 'weather <city>', description: 'current weather' },
      { usage: 'cowsay [text]', description: 'a cow says things' },
      { usage: 'fortune', description: 'words of wisdom' },
      { usage: 'echo, date, whoami, ...', description: 'the usual suspects' },
    ],
  },
];

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
  help: (args: string[]) => {
    if (args.length > 0) {
      return commands['man'](args);
    }

    const t = get(theme);
    const usageWidth = Math.max(
      ...helpSections.flatMap((s) => s.entries.map((e) => e.usage.length)),
    );

    const sections = helpSections.map(
      ({ title, entries }) =>
        `<span style="color: ${t.yellow}">${title}</span>\n` +
        entries
          .map(
            (e) => `  ${escapeHtml(e.usage.padEnd(usageWidth + 3))}${e.description}`,
          )
          .join('\n'),
    );

    return (
      sections.join('\n\n') +
      `\n\n<span style="color: ${t.brightBlack}">This isn't everything. Curious people find more.</span>`
    );
  },
  man: (args: string[]) => {
    if (args.length === 0) {
      return 'What manual page do you want?\nFor example, try: man cowsay';
    }

    const name = args[0];

    for (const section of helpSections) {
      const entry = section.entries.find((e) => e.usage.split(' ')[0] === name);

      if (entry) {
        return `${escapeHtml(entry.usage)} — ${entry.description}`;
      }
    }

    if (commands[name]) {
      return `${name} — no manual entry, but it does exist. Try it.`;
    }

    return `No manual entry for ${escapeHtml(name)}`;
  },
  history: () => {
    const entries = get(history)
      .map((h) => h.command)
      .filter((c) => c !== '');

    if (entries.length === 0) {
      return 'history: empty';
    }

    return entries
      .map((c, i) => `  ${String(i + 1).padStart(3)}  ${escapeHtml(c)}`)
      .join('\n');
  },
  neofetch: () => {
    const t = get(theme);
    const uptimeSeconds = Math.floor((Date.now() - loadedAt) / 1000);
    const uptime =
      uptimeSeconds >= 60
        ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
        : `${uptimeSeconds}s`;

    // rendered width of every line is 16 (&lt;/&gt; display as one char)
    const art = [
      '                ',
      '       o        ',
      '     o   O      ',
      '   &gt;&lt;(((("&gt;     ',
      '     ~  ~       ',
      '  ~~~~~~~~~~~   ',
      '                ',
      '                ',
      '                ',
      '                ',
    ];

    const label = (text: string) => `<span style="color: ${t.yellow}">${text}</span>`;

    const swatch = [t.red, t.green, t.yellow, t.blue, t.purple, t.cyan, t.white]
      .map((color) => `<span style="color: ${color}">███</span>`)
      .join('');

    const info = [
      `<span style="color: ${t.yellow}">guest</span>@<span style="color: ${t.green}">${hostname}</span>`,
      '-'.repeat(`guest@${hostname}`.length),
      `${label('OS:')}         StevenOS ${packageJson.version} (${
        get(machine) === 'modern' ? 'Gruvbox' : machines[get(machine)].label
      } edition)`,
      `${label('Host:')}       ${hostname}`,
      `${label('Shell:')}      jsh ${packageJson.version}`,
      `${label('Uptime:')}     ${uptime}`,
      `${label('Theme:')}      ${t.name}`,
      `${label('CRT:')}        ${get(crt) ? 'on' : 'off'}`,
      `${label('Resolution:')} ${window.innerWidth}x${window.innerHeight}`,
      swatch,
    ];

    return info.map((line, i) => `${art[i] ?? art[0]}${line}`).join('\n');
  },
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
      return `ls: ${escapeHtml(target)}: No such file or directory`;
    }

    if (node.type === 'file') {
      return escapeHtml(target);
    }

    return listNames(node, all).join('  ');
  },
  cd: (args: string[]) => {
    const target = args[0] ?? '~';
    const path = resolvePath(target, get(cwd));
    const node = getNode(path);

    if (!node) {
      return `cd: ${escapeHtml(target)}: No such file or directory`;
    }

    if (node.type !== 'dir') {
      return `cd: ${escapeHtml(target)}: Not a directory`;
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
          return `cat: ${escapeHtml(arg)}: No such file or directory`;
        }

        if (node.type === 'dir') {
          return `cat: ${escapeHtml(arg)}: Is a directory`;
        }

        return node.content();
      })
      .join('\n');
  },
  date: () => new Date().toLocaleString(),
  vi: () => `why use vi? try 'emacs'`,
  vim: () => `why use vim? try 'emacs'`,
  emacs: () => `why use emacs? try 'vim'`,
  echo: (args: string[]) => escapeHtml(args.join(' ')),
  sudo: (args: string[]) => {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    return `Permission denied: unable to run the command '${escapeHtml(args[0] ?? '')}' as root.`;
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
          return `Theme '${escapeHtml(selectedTheme)}' not found. Try 'theme ls' to see all available themes.`;
        }

        theme.set(t);
        machine.set('modern');

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
  machine: (args: string[]) => {
    const usage = `Usage: machine [args].
    [args]:
      ls: list available machines
      set: switch to [machine]

    [Examples]:
      machine ls
      machine set c64`;

    switch (args[0]) {
      case 'ls': {
        const width = Math.max(...Object.keys(machines).map((k) => k.length));

        return Object.values(machines)
          .map((m) => `  ${m.key.padEnd(width + 3)}${m.label}`)
          .join('\n');
      }

      case 'set': {
        const selected = machines[args[1]];

        if (!selected) {
          return `Machine '${escapeHtml(args[1] ?? '')}' not found. Try 'machine ls'.`;
        }

        machine.set(selected.key);
        theme.set(selected.theme);

        return selected.boot;
      }

      default: {
        return usage;
      }
    }
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

    return escapeHtml(await weather.text());
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
    const text = escapeHtml(args.join(' ') || 'moo');
    const border = '-'.repeat((args.join(' ') || 'moo').length + 2);

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

      return escapeHtml(data);
    } catch (error) {
      return `curl: could not fetch URL ${escapeHtml(url)}. Details: ${escapeHtml(String(error))}`;
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
