import { projectsDir } from './filesystem';
import { escapeHtml } from './html';

export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  pushed: string;
}

const USERNAME = 'jessupthefish';
const CACHE_KEY = 'github-repos';
const CACHE_TTL = 60 * 60 * 1000;

function readCache(): { at: number; repos: Repo[] } | null {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  } catch {
    return null;
  }
}

function populateFilesystem(repos: Repo[]) {
  for (const repo of repos) {
    projectsDir.children[repo.name] = {
      type: 'file',
      content: () =>
        [
          `<a href="${repo.url}" target="_blank">${escapeHtml(repo.name)}</a>`,
          `language:  ${escapeHtml(repo.language ?? 'n/a')}`,
          `stars:     ${repo.stars}`,
          `updated:   ${new Date(repo.pushed).toLocaleDateString()}`,
          '',
          escapeHtml(repo.description ?? 'No description.'),
        ].join('\n'),
    };
  }
}

export async function fetchRepos(): Promise<Repo[] | null> {
  const cached = readCache();

  if (cached && Date.now() - cached.at < CACHE_TTL) {
    populateFilesystem(cached.repos);

    return cached.repos;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=100`,
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const data = await response.json();

    const repos: Repo[] = data.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      url: repo.html_url,
      pushed: repo.pushed_at,
    }));

    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
    populateFilesystem(repos);

    return repos;
  } catch {
    if (cached) {
      populateFilesystem(cached.repos);

      return cached.repos;
    }

    return null;
  }
}

export function formatRepoTable(repos: Repo[]): string {
  const nameWidth = Math.max(...repos.map((r) => r.name.length));
  const langWidth = Math.max(...repos.map((r) => (r.language ?? 'n/a').length));

  const rows = repos.map((repo) => {
    const namePad = ' '.repeat(nameWidth - repo.name.length + 2);
    const lang = (repo.language ?? 'n/a').padEnd(langWidth + 2);
    const stars = String(repo.stars).padStart(3);

    return `<a href="${repo.url}" target="_blank">${escapeHtml(repo.name)}</a>${namePad}${escapeHtml(lang)}${stars}★  ${escapeHtml(repo.description ?? '')}`;
  });

  return [
    `${repos.length} public repositories (also browsable via 'ls ~/projects'):`,
    '',
    ...rows,
  ].join('\n');
}
