import fs from 'fs';
import path from 'path';

export interface ADocConfig {
  name: string;
  title: string;
  description: string;
  theme?: string;
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
  
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export function saveConfig(config: ADocConfig): void {
  const configPath = path.resolve('adoc.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
