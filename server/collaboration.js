import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Store collaboration state per document
const COLLAB_DIR = (projectId) =>
  path.join(PROJECTS_DIR, projectId, '.adoc', 'collab');

export function createCollaborationServer() {
  const server = new Server({
    port: 3002,
    quiet: true,

    extensions: [
      new Database({
        fetch: async ({ documentName }) => {
          // documentName format: "projectId:filePath"
          const [projectId, ...rest] = documentName.split(':');
          const filePath = rest.join(':');
          const collabDir = COLLAB_DIR(projectId);
          const stateFile = path.join(
            collabDir,
            filePath.replace(/\//g, '__') + '.ystate'
          );

          try {
            if (await fs.pathExists(stateFile)) {
              const data = await fs.readFile(stateFile);
              return new Uint8Array(data);
            }
          } catch (e) {
            // No stored state, will initialize from markdown
          }
          return null;
        },
        store: async ({ documentName, state }) => {
          const [projectId, ...rest] = documentName.split(':');
          const filePath = rest.join(':');
          const collabDir = COLLAB_DIR(projectId);
          const stateFile = path.join(
            collabDir,
            filePath.replace(/\//g, '__') + '.ystate'
          );

          await fs.ensureDir(collabDir);
          await fs.writeFile(stateFile, Buffer.from(state));
        },
      }),
    ],

    async onAuthenticate({ token, documentName }) {
      // Parse user info from token (JSON string)
      try {
        const user = JSON.parse(token);
        return {
          user: {
            id: user.id,
            name: user.name,
            type: user.type || 'human', // 'human' | 'agent'
            color: user.color || generateColor(user.id),
            avatar: user.avatar || null,
          },
        };
      } catch {
        return {
          user: {
            id: 'anonymous',
            name: '匿名用户',
            type: 'human',
            color: '#6b7280',
          },
        };
      }
    },

    async onConnect({ documentName, context }) {
      console.log(
        `[collab] ${context.user.name} joined ${documentName}`
      );
    },

    async onDisconnect({ documentName, context }) {
      console.log(
        `[collab] ${context.user.name} left ${documentName}`
      );
    },
  });

  return server;
}

function generateColor(id) {
  const colors = [
    '#2563eb', '#dc2626', '#16a34a', '#9333ea',
    '#ea580c', '#0891b2', '#c026d3', '#4f46e5',
  ];
  let hash = 0;
  for (let i = 0; i < (id || '').length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
