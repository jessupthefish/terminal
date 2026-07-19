export interface FsFile {
  type: 'file';
  content: () => string;
}

export interface FsDir {
  type: 'dir';
  children: Record<string, FsNode>;
}

export type FsNode = FsFile | FsDir;

export const HOME = '/home/guest';

const file = (content: string | (() => string)): FsFile => ({
  type: 'file',
  content: typeof content === 'string' ? () => content : content,
});

const dir = (children: Record<string, FsNode>): FsDir => ({
  type: 'dir',
  children,
});

export const projectsDir = dir({
  'README.txt': file(
    "Run 'projects' to pull my latest repositories from GitHub.\nEach one shows up here as a file you can cat.",
  ),
});

export const root: FsDir = dir({
  home: dir({
    guest: dir({
      'about.txt': file(
        "Hi, I'm Steven Jessup — a developer and veteran who's passionate about\nclean code and creative tech. This site is my interactive resume.\nType 'help' to explore.",
      ),
      'contact.txt': file(
        'email:   <a href="mailto:me@stevenjessup.com">me@stevenjessup.com</a>\ngithub:  <a href="https://github.com/jessupthefish" target="_blank">github.com/jessupthefish</a>\nweb:     <a href="https://stevenjessup.com" target="_blank">stevenjessup.com</a>',
      ),
      'resume.pdf': file(
        'This is a terminal, not a PDF reader.\nView it here instead: <a href="https://jessupthefish.github.io/resume" target="_blank">resume.pdf</a>',
      ),
      projects: projectsDir,
      '.plan': file(
        'Ship the terminal site.\nRice everything in Gruvbox.\nWrite clean code. Repeat.',
      ),
      '.secret': file(
        "You found it. Curiosity pays off around here.\nTry these, they're not in 'help': snake, matrix, sudo",
      ),
    }),
  }),
});

export function resolvePath(path: string, cwd: string): string {
  if (!path || path === '~') {
    return HOME;
  }

  if (path.startsWith('~/')) {
    path = HOME + path.slice(1);
  }

  const base = path.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  const parts = path.split('/').filter(Boolean);

  for (const part of parts) {
    if (part === '.') {
      continue;
    }

    if (part === '..') {
      base.pop();
    } else {
      base.push(part);
    }
  }

  return '/' + base.join('/');
}

export function getNode(absPath: string): FsNode | null {
  const parts = absPath.split('/').filter(Boolean);

  let node: FsNode = root;

  for (const part of parts) {
    if (node.type !== 'dir' || !(part in node.children)) {
      return null;
    }

    node = node.children[part];
  }

  return node;
}

export function displayPath(absPath: string): string {
  if (absPath === HOME) {
    return '~';
  }

  if (absPath.startsWith(HOME + '/')) {
    return '~' + absPath.slice(HOME.length);
  }

  return absPath;
}

export function listNames(node: FsDir, all: boolean): string[] {
  return Object.entries(node.children)
    .filter(([name]) => all || !name.startsWith('.'))
    .map(([name, child]) => (child.type === 'dir' ? name + '/' : name))
    .sort();
}

export function completePath(partial: string, cwd: string): string | null {
  const slash = partial.lastIndexOf('/');
  const dirPart = slash === -1 ? '' : partial.slice(0, slash + 1);
  const namePart = slash === -1 ? partial : partial.slice(slash + 1);

  const dirNode = getNode(resolvePath(dirPart || '.', cwd));

  if (!dirNode || dirNode.type !== 'dir') {
    return null;
  }

  const match = Object.keys(dirNode.children)
    .sort()
    .find(
      (name) =>
        name.startsWith(namePart) && (namePart.startsWith('.') || !name.startsWith('.')),
    );

  if (!match) {
    return null;
  }

  const completed = dirPart + match;

  return dirNode.children[match].type === 'dir' ? completed + '/' : completed;
}
