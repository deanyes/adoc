#!/usr/bin/env node
/**
 * ADoc MCP Server
 * 让 Claude/Cursor 等 AI 能够通过 MCP 协议操作 ADoc
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { create, update, get, list, deleteDoc, search } from '../commands/docs.js';
import { importFeishu } from '../commands/import-feishu.js';
import { build } from '../commands/build.js';
import { deploy } from '../commands/deploy.js';

const server = new Server(
  {
    name: 'adoc',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'adoc_list',
        description: 'List all documents in the ADoc project',
        inputSchema: {
          type: 'object' as const,
          properties: {
            category: { type: 'string', description: 'Filter by category' },
          },
        },
      },
      {
        name: 'adoc_get',
        description: 'Get content of a specific document',
        inputSchema: {
          type: 'object' as const,
          properties: {
            id: { type: 'string', description: 'Document ID or slug' },
          },
          required: ['id'],
        },
      },
      {
        name: 'adoc_create',
        description: 'Create a new document',
        inputSchema: {
          type: 'object' as const,
          properties: {
            title: { type: 'string', description: 'Document title' },
            content: { type: 'string', description: 'Document content in Markdown' },
            category: { type: 'string', description: 'Document category' },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'adoc_update',
        description: 'Update an existing document',
        inputSchema: {
          type: 'object' as const,
          properties: {
            id: { type: 'string', description: 'Document ID or slug' },
            content: { type: 'string', description: 'New content (replaces existing)' },
            append: { type: 'string', description: 'Content to append' },
          },
          required: ['id'],
        },
      },
      {
        name: 'adoc_delete',
        description: 'Delete a document',
        inputSchema: {
          type: 'object' as const,
          properties: {
            id: { type: 'string', description: 'Document ID or slug' },
          },
          required: ['id'],
        },
      },
      {
        name: 'adoc_search',
        description: 'Search documents by keyword',
        inputSchema: {
          type: 'object' as const,
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
      },
      {
        name: 'adoc_import_feishu',
        description: 'Import documents from Feishu wiki space',
        inputSchema: {
          type: 'object' as const,
          properties: {
            spaceId: { type: 'string', description: 'Feishu wiki space ID' },
          },
          required: ['spaceId'],
        },
      },
      {
        name: 'adoc_build',
        description: 'Build the documentation site',
        inputSchema: {
          type: 'object' as const,
          properties: {},
        },
      },
      {
        name: 'adoc_deploy',
        description: 'Deploy to hosting platform',
        inputSchema: {
          type: 'object' as const,
          properties: {
            target: { type: 'string', description: 'Deploy target (github-pages, vercel)' },
          },
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args as Record<string, string> || {};
  
  try {
    // Capture stdout by temporarily redirecting console.log
    let output = '';
    const originalLog = console.log;
    console.log = (...args: any[]) => { output += args.join(' ') + '\n'; };

    try {
      switch (name) {
        case 'adoc_list': {
          const listArgs: string[] = [];
          if (a.category) { listArgs.push('--category', a.category); }
          listArgs.push('--json');
          await list(listArgs);
          break;
        }
        case 'adoc_get':
          await get([a.id]);
          break;

        case 'adoc_create': {
          const createArgs = [a.title];
          if (a.content) { createArgs.push('--content', a.content); }
          if (a.category) { createArgs.push('--category', a.category); }
          await create(createArgs);
          break;
        }
        case 'adoc_update': {
          const updateArgs = [a.id];
          if (a.content) { updateArgs.push('--content', a.content); }
          else if (a.append) { updateArgs.push('--append', a.append); }
          await update(updateArgs);
          break;
        }
        case 'adoc_delete':
          await deleteDoc([a.id, '--force']);
          break;

        case 'adoc_search':
          await search([a.query]);
          break;

        case 'adoc_import_feishu':
          await importFeishu([a.spaceId]);
          break;

        case 'adoc_build':
          await build([]);
          break;

        case 'adoc_deploy':
          await deploy([a.target || 'github-pages']);
          break;

        default:
          console.log = originalLog;
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    } finally {
      console.log = originalLog;
    }

    return {
      content: [{ type: 'text', text: output || 'Done' }],
    };
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ADoc MCP Server running');
}

main().catch(console.error);
