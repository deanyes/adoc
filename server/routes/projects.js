import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', '..', 'projects');
const TEMPLATE_DIR = '/Users/chaoxiaoyang/Projects/getbiji-docs-tome';

export const projectsRouter = Router();

// Ensure projects directory exists
fs.ensureDirSync(PROJECTS_DIR);

// GET /api/projects - List all projects
projectsRouter.get('/', async (req, res) => {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = path.join(PROJECTS_DIR, entry.name, 'tome.config.js');
        let name = entry.name;
        let config = {};
        if (await fs.pathExists(configPath)) {
          try {
            const content = await fs.readFile(configPath, 'utf-8');
            // Extract name from config
            const nameMatch = content.match(/name:\s*["'](.+?)["']/);
            if (nameMatch) name = nameMatch[1];
          } catch {}
        }
        projects.push({
          id: entry.name,
          name,
          path: path.join(PROJECTS_DIR, entry.name),
          createdAt: (await fs.stat(path.join(PROJECTS_DIR, entry.name))).birthtime,
        });
      }
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects - Create a new project
projectsRouter.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const projectPath = path.join(PROJECTS_DIR, id);

    if (await fs.pathExists(projectPath)) {
      return res.status(409).json({ error: 'Project already exists' });
    }

    // Copy template (exclude node_modules, .git, out, .vercel, .tome)
    const filter = (src) => {
      const basename = path.basename(src);
      return !['node_modules', '.git', 'out', '.vercel', '.tome', 'package-lock.json'].includes(basename);
    };
    await fs.copy(TEMPLATE_DIR, projectPath, { filter });

    // Update tome.config.js with new project name
    const configPath = path.join(projectPath, 'tome.config.js');
    if (await fs.pathExists(configPath)) {
      let config = await fs.readFile(configPath, 'utf-8');
      config = config.replace(/name:\s*["'].*?["']/, `name: "${name}"`);
      config = config.replace(/basePath:\s*["'].*?["']/, `basePath: "/${id}"`);
      // Remove vite.base if exists
      config = config.replace(/base:\s*["'].*?["'],?\n?/, '');
      await fs.writeFile(configPath, config);
    }

    res.status(201).json({ id, name, path: projectPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id - Delete a project
projectsRouter.delete('/:id', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.id);
    if (!(await fs.pathExists(projectPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await fs.remove(projectPath);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
