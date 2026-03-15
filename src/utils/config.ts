import fs from 'fs';
import path from 'path';

export interface SidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
}

export interface ADocConfig {
  name: string;
  title: string;
  description: string;
  logo?: string;
  theme?: string;
  protect?: string[];
  icons?: 'emoji' | 'none' | 'lucide';
  sidebar?: SidebarItem[];
  import?: {
    feishu?: {
      appId: string;
      appSecret: string;
      spaceId?: string;
    };
    notion?: {
      token: string;
      databaseId?: string;
    };
  };
  build?: {
    theme?: string;
    outDir?: string;
    base?: string;
  };
  deploy?: {
    target?: string;
    repo?: string;
    base?: string;
    domain?: string;
  };
}

export function loadConfig(): ADocConfig {
  const configPath = path.resolve('adoc.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('adoc.config.json not found. Run `adoc init` first.');
    process.exit(1);
  }
  
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    console.error('Failed to parse adoc.config.json. Please check the file format.');
    process.exit(1);
  }
}

const DEFAULT_PROTECT = ['.vitepress/theme/custom.css', '.vitepress/config.mts'];

/**
 * Strip emoji characters from a string
 */
export function stripEmoji(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
    .replace(/^\s+/, '');
}

export function isProtected(filePath: string, config: ADocConfig): boolean {
  const patterns = config.protect ?? DEFAULT_PROTECT;
  const docsDir = path.resolve('docs');
  const rel = path.relative(docsDir, path.resolve(filePath));

  return patterns.some(pattern => {
    const normalized = pattern.replace(/\/$/, '');
    return rel === normalized || rel.startsWith(normalized + '/');
  });
}

export function saveConfig(config: ADocConfig): void {
  const configPath = path.resolve('adoc.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
