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
  theme?: string;
  protect?: string[];
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

const DEFAULT_PROTECT = ['.vitepress/theme/'];

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
