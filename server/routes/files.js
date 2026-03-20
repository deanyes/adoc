import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', '..', 'projects');

export const filesRouter = Router();

// GET /api/projects/:id/files - Get file tree
filesRouter.get('/:id/files', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.id);
    if (!(await fs.pathExists(projectPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tree = await buildFileTree(projectPath, projectPath);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/file?path=xxx - Read file
filesRouter.get('/:id/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'File path is required' });

    const fullPath = path.join(PROJECTS_DIR, req.params.id, filePath);
    // Prevent path traversal
    if (!fullPath.startsWith(path.join(PROJECTS_DIR, req.params.id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!(await fs.pathExists(fullPath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    res.json({ path: filePath, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id/file?path=xxx - Save file
filesRouter.put('/:id/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'File path is required' });

    const fullPath = path.join(PROJECTS_DIR, req.params.id, filePath);
    if (!fullPath.startsWith(path.join(PROJECTS_DIR, req.params.id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, req.body.content);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/file?path=xxx - Create new file
filesRouter.post('/:id/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'File path is required' });

    const fullPath = path.join(PROJECTS_DIR, req.params.id, filePath);
    if (!fullPath.startsWith(path.join(PROJECTS_DIR, req.params.id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (await fs.pathExists(fullPath)) {
      return res.status(409).json({ error: 'File already exists' });
    }

    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, req.body.content || '');
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id/file?path=xxx - Delete file
filesRouter.delete('/:id/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: 'File path is required' });

    const fullPath = path.join(PROJECTS_DIR, req.params.id, filePath);
    if (!fullPath.startsWith(path.join(PROJECTS_DIR, req.params.id))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!(await fs.pathExists(fullPath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.remove(fullPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function buildFileTree(basePath, currentPath) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const items = [];

  const skipDirs = ['node_modules', '.git', 'out', '.vercel', '.tome'];

  for (const entry of entries.sort((a, b) => {
    // Directories first
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  })) {
    if (skipDirs.includes(entry.name)) continue;

    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(basePath, fullPath);

    if (entry.isDirectory()) {
      const children = await buildFileTree(basePath, fullPath);
      items.push({ name: entry.name, path: relativePath, type: 'directory', children });
    } else {
      items.push({ name: entry.name, path: relativePath, type: 'file' });
    }
  }

  return items;
}
