import { Octokit } from '@octokit/rest';

// --- Auth & Config Store ---

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

const STORAGE_KEY_TOKEN = 'adoc-github-token';
const STORAGE_KEY_REPO = 'adoc-github-repo';

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

export function setToken(token: string) {
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
}

export function clearToken() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

export function getRepoConfig(): RepoConfig | null {
  const raw = localStorage.getItem(STORAGE_KEY_REPO);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setRepoConfig(config: RepoConfig) {
  localStorage.setItem(STORAGE_KEY_REPO, JSON.stringify(config));
}

export function clearRepoConfig() {
  localStorage.removeItem(STORAGE_KEY_REPO);
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getRepoConfig();
}

// --- Octokit instance ---

let _octokit: Octokit | null = null;

export function getOctokit(): Octokit {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  if (!_octokit) {
    _octokit = new Octokit({ auth: token });
  }
  return _octokit;
}

export function resetOctokit() {
  _octokit = null;
}

// --- Types ---

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  sha?: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

// --- API Functions ---

export async function fetchUser(): Promise<GitHubUser> {
  const octokit = getOctokit();
  const { data } = await octokit.users.getAuthenticated();
  return data;
}

export async function fetchRepos(): Promise<{ full_name: string; default_branch: string }[]> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });
  return data.map((r) => ({
    full_name: r.full_name,
    default_branch: r.default_branch,
  }));
}

export async function fetchFileTree(
  config?: RepoConfig
): Promise<FileNode[]> {
  const { owner, repo, branch } = config || getRepoConfig()!;
  const octokit = getOctokit();

  // Get the full tree recursively
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: 'true',
  });

  // Build tree structure from flat list
  const root: FileNode[] = [];
  const dirMap = new Map<string, FileNode>();

  // Filter: only include docs-relevant files (md, mdx, config files, images)
  const items = data.tree.filter((item) => {
    if (!item.path) return false;
    // Skip hidden files and common non-doc dirs
    if (item.path.startsWith('.') || item.path.includes('/.')) return false;
    if (item.path.startsWith('node_modules/')) return false;
    if (item.path.startsWith('out/')) return false;
    return true;
  });

  // Sort: directories first, then alphabetically
  items.sort((a, b) => {
    const aIsDir = a.type === 'tree';
    const bIsDir = b.type === 'tree';
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
    return (a.path || '').localeCompare(b.path || '');
  });

  for (const item of items) {
    const path = item.path!;
    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const isDir = item.type === 'tree';

    const node: FileNode = {
      name,
      path,
      type: isDir ? 'directory' : 'file',
      sha: item.sha,
      children: isDir ? [] : undefined,
    };

    if (isDir) {
      dirMap.set(path, node);
    }

    if (parts.length === 1) {
      root.push(node);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = dirMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  }

  return root;
}

export async function readFile(filePath: string, config?: RepoConfig): Promise<{ content: string; sha: string }> {
  const { owner, repo, branch } = config || getRepoConfig()!;
  const octokit = getOctokit();

  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branch,
  });

  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error('Not a file');
  }

  const content = atob(data.content);
  // Handle UTF-8 properly
  const bytes = new Uint8Array(content.length);
  for (let i = 0; i < content.length; i++) {
    bytes[i] = content.charCodeAt(i);
  }
  const decoded = new TextDecoder('utf-8').decode(bytes);

  return { content: decoded, sha: data.sha };
}

export async function saveFile(
  filePath: string,
  content: string,
  sha: string,
  message?: string,
  config?: RepoConfig
): Promise<{ sha: string }> {
  const { owner, repo, branch } = config || getRepoConfig()!;
  const octokit = getOctokit();

  // Encode content as base64 (handle UTF-8)
  const encoder = new TextEncoder();
  const bytes = encoder.encode(content);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Content = btoa(binary);

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: message || `Update ${filePath}`,
    content: base64Content,
    sha,
    branch,
  });

  return { sha: data.content?.sha || sha };
}

export async function createFile(
  filePath: string,
  content: string,
  message?: string,
  config?: RepoConfig
): Promise<{ sha: string }> {
  const { owner, repo, branch } = config || getRepoConfig()!;
  const octokit = getOctokit();

  const encoder = new TextEncoder();
  const bytes = encoder.encode(content);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Content = btoa(binary);

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: message || `Create ${filePath}`,
    content: base64Content,
    branch,
  });

  return { sha: data.content?.sha || '' };
}

export async function deleteFile(
  filePath: string,
  sha: string,
  message?: string,
  config?: RepoConfig
): Promise<void> {
  const { owner, repo, branch } = config || getRepoConfig()!;
  const octokit = getOctokit();

  await octokit.repos.deleteFile({
    owner,
    repo,
    path: filePath,
    message: message || `Delete ${filePath}`,
    sha,
    branch,
  });
}
