import { importFeishu } from './commands/import-feishu.js';
import { build } from './commands/build.js';
import { deploy } from './commands/deploy.js';
import { init } from './commands/init.js';

const HELP = `
ADoc - Agent-first documentation tool

Usage: adoc <command> [options]

Commands:
  init                    Initialize a new ADoc project
  import feishu <url>     Import docs from Feishu space
  build                   Build static site
  deploy <target>         Deploy to hosting (github-pages, vercel)
  
Options:
  -h, --help              Show help
  -v, --version           Show version

Examples:
  adoc init
  adoc import feishu https://feishu.cn/wiki/xxx
  adoc build
  adoc deploy github-pages
`;

export async function main(args: string[]) {
  const cmd = args[0];
  
  if (!cmd || cmd === '-h' || cmd === '--help') {
    console.log(HELP);
    return;
  }
  
  if (cmd === '-v' || cmd === '--version') {
    console.log('0.1.0');
    return;
  }
  
  try {
    switch (cmd) {
      case 'init':
        await init(args.slice(1));
        break;
      case 'import':
        if (args[1] === 'feishu') {
          await importFeishu(args.slice(2));
        } else {
          console.error(`Unknown import source: ${args[1]}`);
        }
        break;
      case 'build':
        await build(args.slice(1));
        break;
      case 'deploy':
        await deploy(args.slice(1));
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        console.log(HELP);
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
