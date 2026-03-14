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
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category',
            },
          },
        },
      },
      {
        name: 'adoc_get',
        description: 'Get content of a specific document',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Document ID or slug',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'adoc_create',
        description: 'Create a new document',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Document title',
            },
            content: {
              type: 'string',
              description: 'Document content in Markdown',
            },
            category: {
              type: 'string',
              description: 'Document category',
            },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'adoc_update',
        description: 'Update an existing document',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Document ID or slug',
            },
            content: {
              type: 'string',
              description: 'New content (replaces existing)',
            },
            append: {
              type: 'string',
              description: 'Content to append',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'adoc_delete',
        description: 'Delete a document',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Document ID or slug',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'adoc_search',
        description: 'Search documents by keyword',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'adoc_import_feishu',
        description: 'Import documents from Feishu wiki space',
        inputSchema: {
          type: 'object',
          properties: {
            spaceId: {
              type: 'string',
              description: 'Feishu wiki space ID',
            },
          },
          required: ['spaceId'],
        },
      },
      {
        name: 'adoc_build',
        description: 'Build the documentation site',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'adoc_deploy',
        description: 'Deploy to hosting platform',
        inputSchema: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              description: 'Deploy target (github-pages, vercel)',
              default: 'github-pages',
            },
          },
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result: string;
    
    switch (name) {
      case 'adoc_list':
        result = execSync(`adoc list ${args?.category ? `--category "${args.category}"` : ''} --json`, { encoding: 'utf-8' });
        break;
        
      case 'adoc_get':
        result = execSync(`adoc get "${args?.id}"`, { encoding: 'utf-8' });
        break;
        
      case 'adoc_create':
        result = execSync(`adoc create "${args?.title}" --content "${args?.content?.replace(/"/g, '\\"')}" ${args?.category ? `--category "${args.category}"` : ''}`, { encoding: 'utf-8' });
        break;
        
      case 'adoc_update':
        if (args?.content) {
          result = execSync(`adoc update "${args?.id}" --content "${args?.content?.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
        } else if (args?.append) {
          result = execSync(`adoc update "${args?.id}" --append "${args?.append?.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
        } else {
          result = 'No content or append provided';
        }
        break;
        
      case 'adoc_delete':
        result = execSync(`adoc delete "${args?.id}" --force`, { encoding: 'utf-8' });
        break;
        
      case 'adoc_search':
        result = execSync(`adoc search "${args?.query}"`, { encoding: 'utf-8' });
        break;
        
      case 'adoc_import_feishu':
        result = execSync(`adoc import feishu "${args?.spaceId}"`, { encoding: 'utf-8' });
        break;
        
      case 'adoc_build':
        result = execSync('adoc build', { encoding: 'utf-8' });
        break;
        
      case 'adoc_deploy':
        result = execSync(`adoc deploy ${args?.target || 'github-pages'}`, { encoding: 'utf-8' });
        break;
        
      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
    
    return {
      content: [{ type: 'text', text: result }],
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
