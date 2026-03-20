import { Router } from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = path.join(__dirname, '..', '..', 'projects');

export const buildRouter = Router();

// POST /api/projects/:id/preview - Install deps + run dev server
buildRouter.post('/:id/preview', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.id);
    if (!(await fs.pathExists(projectPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Install deps if needed
    const nodeModules = path.join(projectPath, 'node_modules');
    if (!(await fs.pathExists(nodeModules))) {
      await runCommand('npm install', projectPath);
    }

    // Run build
    const result = await runCommand('npx tome build', projectPath);
    const outDir = path.join(projectPath, 'out');

    res.json({
      success: true,
      output: result,
      previewUrl: `/sites/${req.params.id}/out/`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/publish - Build and publish
buildRouter.post('/:id/publish', async (req, res) => {
  try {
    const projectPath = path.join(PROJECTS_DIR, req.params.id);
    if (!(await fs.pathExists(projectPath))) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Install deps if needed
    const nodeModules = path.join(projectPath, 'node_modules');
    if (!(await fs.pathExists(nodeModules))) {
      await runCommand('npm install', projectPath);
    }

    // Build
    const result = await runCommand('npx tome build', projectPath);

    res.json({
      success: true,
      output: result,
      publishUrl: `/sites/${req.params.id}/out/`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function runCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${error.message}\n${stderr}`));
        return;
      }
      resolve(stdout + stderr);
    });
  });
}
