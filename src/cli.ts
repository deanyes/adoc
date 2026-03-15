import fs from "fs";

import { importFeishu } from './commands/import-feishu.js';
import { build } from './commands/build.js';
import { deploy } from './commands/deploy.js';
import { init } from './commands/init.js';
import { preview } from './commands/preview.js';
import { sync } from './commands/sync.js';
import { status } from './commands/status.js';
import { create, update, get, list, deleteDoc, search, index } from './commands/docs.js';

const HELP = `
ADoc - Agent-first documentation tool

Usage: adoc <command> [options]

Commands:
  init [name]              Initialize a new ADoc project
  status                   Show project status
  
  # Document CRUD
  create <title>           Create a new document
  update <id>              Update a document  
  get <id>                 Get document content
  list                     List all documents
  delete <id>              Delete a document
  search <query>           Search documents
  index                    Rebuild document index
  
  # Import & Sync
  import feishu <space-id> Import from Feishu wiki
  sync                     Sync changes from source
  
  # Build & Deploy
  build                    Build static site
  preview                  Start preview server
  deploy [target]          Deploy (github-pages, vercel, cloudflare)

Options:
  -h, --help               Show help
  -v, --version            Show version
`;

export async function main(args: string[]) {
  const cmd = args[0];
  
  if (!cmd || cmd === '-h' || cmd === '--help' || cmd === 'help') {
    console.log(HELP);
    return;
  }
  
  if (cmd === '-v' || cmd === '--version') {
    const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
    console.log(pkg.version);
    return;
  }
  
  try {
    switch (cmd) {
      case 'init':
        await init(args.slice(1));
        break;
      case 'status':
        await status(args.slice(1));
        break;
      case 'create':
        await create(args.slice(1));
        break;
      case 'update':
        await update(args.slice(1));
        break;
      case 'get':
        await get(args.slice(1));
        break;
      case 'list':
        await list(args.slice(1));
        break;
      case 'delete':
        await deleteDoc(args.slice(1));
        break;
      case 'search':
        await search(args.slice(1));
        break;
      case 'index':
        await index(args.slice(1));
        break;
      case 'import':
        if (args[1] === 'feishu') {
          await importFeishu(args.slice(2));
        } else {
          console.error(`Unknown import source: ${args[1]}`);
        }
        break;
      case 'sync':
        await sync(args.slice(1));
        break;
      case 'build':
        await build(args.slice(1));
        break;
      case 'preview':
        await preview(args.slice(1));
        break;
      case 'deploy':
        await deploy(args.slice(1));
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        console.log('Run `adoc --help` for usage.');
    }
  } catch (err: any) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}
